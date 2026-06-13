# hyttynen
linux based web hardware info monitor.

Prerequisites:
1. mosquittto_pub
2. jq

##Client
Port 1000 is exposed on host.
##Server
Port 5000 is exposed on host.
##MQTT
Starting the container.
Port 1883 is exposed on the host.

##Ecosystem
This is part of the moon ecosystem.
Other parts of the ecosystem:
1. Fanttimoon - Postgres database container
2. Puppumoon - Helper for generating rando data
3. Redismoon - Redis cache container
