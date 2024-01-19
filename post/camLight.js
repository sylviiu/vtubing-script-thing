const { token, location, devices } = require(`../config.json`).hass;

module.exports = () => new Promise(async res => {
    console.log(`Turning on ${devices.length} device(s)...`);

    for(const entity of devices) {
        console.log(`Turning on ${entity}...`);

        try {
            const req = await fetch(`${location}/api/services/light/turn_off`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    entity_id: entity,
                }),
            });
    
            const response = await req.json();
    
            console.log(`Turned on ${entity}...`, response);
        } catch(e) {
            console.error(`Failed to turn on ${entity}...`, e);
        }
    };

    console.log(`Turned on ${devices.length} device(s)...`);

    res();
})