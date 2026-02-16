#!/bin/bash
#
# Network Monitor Script
# Scans local network, detects new devices, logs alerts
#

set -euo pipefail

# Configuration
WHITELIST_FILE="${WHITELIST_FILE:-/home/umbrel/network-whitelist.txt}"
ALERT_LOG="${ALERT_LOG:-/home/umbrel/network-alerts.log}"
LOG_FORMAT="[%Y-%m-%d %H:%M:%S]"

# Ensure whitelist exists
touch "$WHITELIST_FILE"

# Function to log alerts
log_alert() {
    local device_ip="$1"
    local device_mac="$2"
    local timestamp
    timestamp=$(date "+$LOG_FORMAT")
    echo "$timestamp NEW_DEVICE IP=$device_ip MAC=$device_mac" >> "$ALERT_LOG"
}

# Function to check if device is whitelisted
is_whitelisted() {
    local ip="$1"
    local mac="$2"
    
    # Check IP whitelist
    if grep -qE "^$ip\$" "$WHITELIST_FILE" 2>/dev/null; then
        return 0
    fi
    
    # Check MAC whitelist (case insensitive)
    if grep -qiE "^$mac\$" "$WHITELIST_FILE" 2>/dev/null; then
        return 0
    fi
    
    return 1
}

# Main scan
echo "Scanning network..."

# Get network interface and subnet
INTERFACE=$(ip route | awk '/default/ {print $5; exit}' | head -1)
SUBNET=$(ip -4 addr show "$INTERFACE" 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}/\d+' | head -1)

if [[ -z "$INTERFACE" ]] || [[ -z "$SUBNET" ]]; then
    echo "Error: Could not determine network interface or subnet"
    exit 1
fi

echo "Using interface: $INTERFACE"
echo "Scanning subnet: $SUBNET"
echo ""

# Run arp-scan
if ! command -v arp-scan &>/dev/null; then
    echo "Error: arp-scan is not installed"
    echo "Install with: sudo apt-get install arp-scan"
    exit 1
fi

# Scan and parse results
NEW_DEVICES=()
WHITELISTED_COUNT=0
UNKNOWN_COUNT=0

while IFS= read -r line; do
    # Parse ARP scan output (IP and MAC)
    IP=$(echo "$line" | awk '{print $1}')
    MAC=$(echo "$line" | awk '{print $2}')
    
    # Skip header/footer lines
    [[ -z "$IP" ]] || [[ -z "$MAC" ]] && continue
    [[ "$IP" =~ ^[[:alpha:]] ]] && continue
    [[ "$MAC" == "Address" ]] && continue
    
    # Check if whitelisted
    if is_whitelisted "$IP" "$MAC"; then
        ((WHITELISTED_COUNT++)) || true
    else
        NEW_DEVICES+=("$IP|$MAC")
        log_alert "$IP" "$MAC"
        ((UNKNOWN_COUNT++)) || true
    fi
done < <(arp-scan --localnet --quiet 2>/dev/null)

# Output results
echo "=== Network Scan Results ==="
echo "Whitelisted devices: $WHITELISTED_COUNT"
echo "New/Unknown devices: $UNKNOWN_COUNT"
echo ""

if [[ ${#NEW_DEVICES[@]} -gt 0 ]]; then
    echo "New devices found:"
    printf "%s\n" "${NEW_DEVICES[@]}" | while IFS='|' read -r ip mac; do
        echo "  - $ip ($mac)"
    done
    echo ""
    echo "Logged to: $ALERT_LOG"
else
    echo "No new devices detected. Network clean."
fi

# Return new devices list for scripting
printf "%s\n" "${NEW_DEVICES[@]}"