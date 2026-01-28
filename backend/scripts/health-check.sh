#!/bin/bash
# Health Check Script
# Monitors the health of deployed services

set -e

API_URL=${1:-"https://api.sepi.pro"}
FRONTEND_URL=${2:-"https://sepi.pro"}

echo "🏥 SEPI Health Check"
echo "===================="
echo ""

# Check API Health
echo "🔍 Checking API health..."
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${API_URL}/health || echo "000")

if [ "$API_RESPONSE" = "200" ]; then
    echo "✅ API is healthy (${API_URL})"
    
    # Get detailed health info
    HEALTH_DATA=$(curl -s ${API_URL}/health)
    echo "   Status: $(echo $HEALTH_DATA | jq -r '.status')"
    echo "   Uptime: $(echo $HEALTH_DATA | jq -r '.uptime')s"
    echo "   Database: $(echo $HEALTH_DATA | jq -r '.services.database')"
    echo "   S3: $(echo $HEALTH_DATA | jq -r '.services.s3')"
    echo "   SQS: $(echo $HEALTH_DATA | jq -r '.services.sqs')"
else
    echo "❌ API is unhealthy (HTTP ${API_RESPONSE})"
    exit 1
fi

echo ""

# Check Frontend
echo "🔍 Checking frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL} || echo "000")

if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo "✅ Frontend is accessible (${FRONTEND_URL})"
else
    echo "❌ Frontend is not accessible (HTTP ${FRONTEND_RESPONSE})"
    exit 1
fi

echo ""

# Check SSL Certificate
echo "🔍 Checking SSL certificate..."
SSL_EXPIRY=$(echo | openssl s_client -servername sepi.pro -connect sepi.pro:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
echo "✅ SSL certificate valid until: ${SSL_EXPIRY}"

echo ""

# Check DNS
echo "🔍 Checking DNS resolution..."
API_IP=$(dig +short api.sepi.pro | head -n1)
FRONTEND_IP=$(dig +short sepi.pro | head -n1)

if [ ! -z "$API_IP" ]; then
    echo "✅ api.sepi.pro resolves to: ${API_IP}"
else
    echo "❌ api.sepi.pro does not resolve"
    exit 1
fi

if [ ! -z "$FRONTEND_IP" ]; then
    echo "✅ sepi.pro resolves to: ${FRONTEND_IP}"
else
    echo "❌ sepi.pro does not resolve"
    exit 1
fi

echo ""
echo "✅ All health checks passed!"
