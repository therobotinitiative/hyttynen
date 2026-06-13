#!/bin/bash

# --- CONFIGURATION ---
MQTT_HOST="127.0.0.1"
MQTT_PORT="1883"
MQTT_TOPIC="hwinfo"
# Use hostname as a unique device identifier key in JSON
HOSTNAME=$(hostname)

VERBOSE=0

function print_usage() {
  echo "parameters:"
  echo "-v, --verbose, verbose : Enable verbose"
  echo "host=<host> : Use different host, default 127.0.0.1"
  echo "port=<port> : Use different port, default 1883"
  echo "topic=<topic> : Use different topic, default hwinfo"
}

# Go trough arguments
for ARG in "$@"; do
  # HELP
  if [ "$ARG" = "--help" ]; then
    print_usage
  fi
  # Verbose
  if [ "$ARG" = "verbose" ] || [ "$ARG" = "--verbose" ]|| [ "$ARG" = "-v" ]; then
    VERBOSE=1
    echo "Verbose mode enabled"
  fi
  # Convert argument to uppercase *only* for the check to handle host= or HOST=
  arg_upper=$(echo "$ARG" | tr '[:lower:]' '[:upper:]')

  # host parameter
  if [[ "$arg_upper" == HOST=* ]]; then
    # Use parameter expansion to strip everything up to the "=" sign
    MQTT_HOST="${ARG#*=}"
  fi

  # port parameter
  if [[ "$arg_upper" == PORT=* ]]; then
    # Use parameter expansion to strip everything up to the "=" sign
    MQTT_PORT="${ARG#*=}"
  fi

  # topic parameter
  if [[ "$arg_upper" == TOPIC=* ]]; then
    # Use parameter expansion to strip everything up to the "=" sign
    MQTT_TOPIC="${ARG#*=}"
  fi
done

function verbose() {
  if [ "$VERBOSE" == "1" ]; then
    echo "$1"
  fi
}

# --- GATHER METRICS ---
# OS Information
OS_NAME=$(lsb_release -sd 2>/dev/null || cat /etc/os-release | grep "PRETTY_NAME" | cut -d= -f2 | tr -d '"')
UPTIME=$(uptime -p)

# CPU Load & Temperature
CPU_LOAD=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

# Robust CPU Temp fallback detection
if [ -f "/sys/class/thermal/thermal_zone0/temp" ]; then
    CPU_TEMP=$(awk '{print $1/1000}' /sys/class/thermal/thermal_zone0/temp)
elif [ -f "/sys/class/thermal/thermal_zone1/temp" ]; then
    CPU_TEMP=$(awk '{print $1/1000}' /sys/class/thermal/thermal_zone1/temp)
elif ls /sys/class/hwmon/hwmon*/temp1_input >/dev/null 2>&1; then
    # Fallback to hwmon drivers (common on desktop/amd systems)
    HWMON_PATH=$(ls /sys/class/hwmon/hwmon*/temp1_input | head -n 1)
    CPU_TEMP=$(awk '{print $1/1000}' "$HWMON_PATH")
else
    # Safe fallback if no thermal paths exist (e.g., virtual machines)
    CPU_TEMP="null"
fi

# Memory Metrics (in MB)
RAM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
RAM_USED=$(free -m | awk '/^Mem:/{print $3}')
RAM_FREE=$(free -m | awk '/^Mem:/{print $4}')

# --- GATHER METRICS FOR ALL LOCAL PARTITIONS ---
# We use df -x to filter out virtual/temporary filesystems (tmpfs, devtmpfs, squashfs, etc.)
DISK_JSON_ARRAY="[]"
TEMP_DISK_ARRAY=""

# Read df output line by line, skipping the header (NR>1)
while read -r filesystem total used available percent mountpoint; do
    # Strip the trailing '%' sign from the percentage field
    clean_percent=$(echo "$percent" | tr -d '%')

    # Build a JSON object for this individual partition
    DISK_ITEM_STR=$(jq -n \
      --arg mount "$mountpoint" \
      --arg tot "$total" \
      --arg usd "$used" \
      --argjson pct "$clean_percent" \
      '{mount_point: $mount, total: $tot, used: $usd, used_percent: $pct}')

    # Append to our temporary array accumulator string
    if [ -z "$TEMP_DISK_ARRAY" ]; then
        TEMP_DISK_ARRAY="$DISK_ITEM_STR"
    else
        TEMP_DISK_ARRAY="$TEMP_DISK_ARRAY,$DISK_ITEM_STR"
    fi
done < <(df -h -x tmpfs -x devtmpfs -x squashfs -x overlay 2>/dev/null | awk 'NR>1')

DISK_JSON_ARRAY="[$TEMP_DISK_ARRAY]"

#  --- BUILD JSON & PUBLISH ---
# Construct a safe JSON payload using jq
JSON_PAYLOAD=$(jq -n \
  --arg hostname "$HOSTNAME" \
  --arg os "$OS_NAME" \
  --arg uptime "$UPTIME" \
  --arg cpu_load "$CPU_LOAD" \
  --arg cpu_temp "$CPU_TEMP" \
  --argjson disks "$DISK_JSON_ARRAY" \
  --arg ram_total "$RAM_TOTAL" \
  --arg ram_used "$RAM_USED" \
  --arg ram_free "$RAM_FREE" \
  '{
    device: $hostname,
    os: $os,
    uptime: $uptime,
    cpu: { 
      load_percent: ($cpu_load | tonumber), 
      temp_c: (if $cpu_temp == "null" then null else ($cpu_temp | tonumber) end) 
    },
    memory_mb: { 
      total: ($ram_total | tonumber), 
      used: ($ram_used | tonumber), 
      free: ($ram_free | tonumber) 
    },
    disks: $disks
  }')

# Send to the MQTT Broker
verbose "Publishing hardware information to mqtt://$MQTT_HOST:$MQTT_PORT/$MQTT_TOPIC message: $JSON_PAYLOAD"
mosquitto_pub -h "$MQTT_HOST" -p "$MQTT_PORT" -t "$MQTT_TOPIC" -m "$JSON_PAYLOAD"