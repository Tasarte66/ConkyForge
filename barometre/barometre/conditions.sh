#!/bin/bash
# Define the API URL for Open-Meteo with both daily and hourly parameters
URL="https://api.open-meteo.com/v1/forecast?latitude=40.45006&longitude=-3.80910&daily=precipitation_sum,daylight_duration,sunset&hourly=temperature_2m,apparent_temperature,precipitation_probability,wind_speed_10m,wind_gusts_10m,relative_humidity_2m,weathercode&timezone=Europe%2FBerlin"

# Fetch data from Open-Meteo
response=$(curl -s "$URL")

# Check if the response is empty or has an error
if [ -z "$response" ] || [[ "$response" == *"\"error\""* ]]; then
    echo "Error en la API o sin conexión"
    echo "N/A"
    echo "N/A"
    echo "N/A"
    exit 1
fi

# Get current hour index
current_hour=$(date +%H)

# Extract data
temp_max=$(echo "$response" | jq -r ".hourly.temperature_2m[$current_hour] // \"N/A\"")
temp_min=$(echo "$response" | jq -r ".hourly.apparent_temperature[$current_hour] // \"N/A\"")
precipitation=$(echo "$response" | jq -r '.daily.precipitation_sum[0] // "N/A"')
precip_prob=$(echo "$response" | jq -r ".hourly.precipitation_probability[$current_hour] // \"N/A\"")
wind_speed=$(echo "$response" | jq -r ".hourly.wind_speed_10m[$current_hour] // \"N/A\"")
wind_gusts=$(echo "$response" | jq -r ".hourly.wind_gusts_10m[$current_hour] // \"N/A\"")
humidity=$(echo "$response" | jq -r ".hourly.relative_humidity_2m[$current_hour] // \"N/A\"")
weather_code=$(echo "$response" | jq -r ".hourly.weathercode[$current_hour] // \"N/A\"")
sunshine_duration=$(echo "$response" | jq -r ".daily.daylight_duration[0] // \"N/A\"")
sunset=$(echo "$response" | jq -r ".daily.sunset[0] // \"N/A\"" | awk -F'T' '{print substr($2, 1, 5)}')

# Convertir duración del sol a horas y minutos
hours=$(echo "$sunshine_duration / 3600" | bc) 
minutes=$(echo "($sunshine_duration % 3600) / 60" | bc)

# Función para determinar icono según código meteorológico
get_weather_icon() {
    local code=$1
    local icon=""
    
    case $code in
        0) icon=""  ;; # Cielo despejado
        1) icon=""  ;; # Mayormente despejado
        2) icon=""   ;; # Parcialmente nublado
        3) icon=""   ;; # Nublado
        45|48) icon="🌫️" ;; # Niebla
        51|53|55) icon="" ;; # Llovizna
        56|57) icon="❄" ;; # Llovizna helada
        61|63|65) icon="" ;; # Lluvia
        66|67) icon="🌨" ;; # Lluvia helada
        71|73|75) icon="" ;; # Nevada
        77) icon="󱋋" ;; # Granizo
        80|81|82) icon="" ;; # Chubascos
        85|86) icon="🌨" ;; # Chubascos de nieve
        95) icon="⛈" ;; # Tormenta
        96|99) icon="⛈" ;; # Tormenta con granizo
        *) icon="🌡️" ;; # Desconocido
    esac
    
    echo $icon
}

# Función para icono de precipitación
get_precip_icon() {
    local prob=$1
    local icon=""
    
    if [ "$prob" = "N/A" ]; then
        icon="❓"
    else
        # Usar bc para comparaciones decimales
        if (( $(echo "$prob < 10" | bc -l) )); then
            icon=""
        elif (( $(echo "$prob < 30" | bc -l) )); then
            icon=""
        elif (( $(echo "$prob < 60" | bc -l) )); then
            icon=""
        else
            icon=""
        fi
    fi
    
    echo $icon
}

# Función para icono de viento
get_wind_icon() {
    local speed=$1
    local icon=""
    
    if [ "$speed" = "N/A" ]; then
        icon="❓"
    else
        # Usar bc para comparaciones decimales
        if (( $(echo "$speed < 10" | bc -l) )); then
            icon=""
        elif (( $(echo "$speed < 20" | bc -l) )); then
            icon=""
        elif (( $(echo "$speed < 40" | bc -l) )); then
            icon=""
        else
            icon="🌪️"
        fi
    fi
    
    echo $icon
}

# Obtener iconos
weather_icon=$(get_weather_icon "$weather_code")
precip_icon=$(get_precip_icon "$precip_prob")
wind_icon=$(get_wind_icon "$wind_speed")

# Print values with icons
{
    echo "\${font Hack Nerd Font:size=14}${weather_icon}\${font Hack Nerd Font:size=9}  Temp.: ${temp_max}°C"
    echo "\${font Hack Nerd Font:size=14}󰔄\${font Hack Nerd Font:size=9}  Sensación: ${temp_min}°C"
    echo "\${font Hack Nerd Font:size=14}${precip_icon} \${font Hack Nerd Font:size=9} Lluvia: ${precipitation}"
    echo "\${font Hack Nerd Font:size=14} \${font Hack Nerd Font:size=9} Prob. Lluvia: ${precip_prob}%"
    echo "\${font Hack Nerd Font:size=14}${wind_icon} \${font Hack Nerd Font:size=9} Viento: ${wind_speed} km/h"
    echo "\${font Hack Nerd Font:size=14} \${font Hack Nerd Font:size=9} Humedad: ${humidity}%"
    echo "\${font Hack Nerd Font:size=14} \${font Hack Nerd Font:size=9} Duración día: ${hours}h ${minutes}min"
    echo "\${font Hack Nerd Font:size=14} \${font Hack Nerd Font:size=9} Sunset: ${sunset}"
}