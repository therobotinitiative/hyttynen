#!/bin/bash

# --- CONFIGURATION ---
MQTT_HOST="127.0.0.1"
MQTT_PORT="1883"
MQTT_TOPIC="hwinfo"
# Use hostname as a unique device identifier key in JSON
HOSTNAME=$(hostname)

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

# Disk Space Metrics for Root / (Percentage and GB)
DISK_TOTAL=$(df -h / | awk 'NR==2 {print $2}')
DISK_USED=$(df -h / | awk 'NR==2 {print $3}')
DISK_PERCENT=$(df / | awk 'NR==2 {print $5}' | tr -d '%')

#  --- BUILD JSON & PUBLISH ---
# Construct a safe JSON payload using jq
JSON_PAYLOAD=$(jq -n \
  --arg hostname "$HOSTNAME" \
  --arg os "$OS_NAME" \
  --arg uptime "$UPTIME" \
  --arg cpu_load "$CPU_LOAD" \
  --arg cpu_temp "$CPU_TEMP" \
  --arg ram_total "$RAM_TOTAL" \
  --arg ram_used "$RAM_USED" \
  --arg ram_free "$RAM_FREE" \
  --arg disk_total "$DISK_TOTAL" \
  --arg disk_used "$DISK_USED" \
  --arg disk_percent "$DISK_PERCENT" \
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
    disk_root: { 
      total: $disk_total, 
      used: $disk_used, 
      used_percent: ($disk_percent | tonumber) 
    }
  }')

# Send to the MQTT Broker
mosquitto_pub -h "$MQTT_HOST" -p "$MQTT_PORT" -t "$MQTT_TOPIC" -m "$JSON_PAYLOAD"
echo $JSON_PAYLOAD
