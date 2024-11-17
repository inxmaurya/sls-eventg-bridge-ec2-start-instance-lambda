const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const ec2 = new AWS.EC2();

module.exports.startInstance = async (event) => {
    try {
        // Replace with the instance ID you want to start
        const instanceId = event.detail?.["instance-id"];
        if (!instanceId) {
          console.error("No instance ID found in the event.");
          return;
        }

        // 1. Check the current state of the instance
        const describeResponse = await ec2.describeInstances({
            InstanceIds: [instanceId],
        }).promise();

        const instance = describeResponse.Reservations[0]?.Instances[0];
        if (!instance) {
            console.error(`Instance ${instanceId} not found.`);
            return;
        }

        const currentState = instance.State.Name;
        console.log(`Current state of instance ${instanceId}: ${currentState}`);

        // 2. If the instance is already running, exit
        if (currentState === "running") {
            console.log(`Instance ${instanceId} is already running.`);
            return;
        }

        // 3. Start the instance if it is stopped
        if (currentState === "stopped") {
            console.log(`Starting instance ${instanceId}...`);
            const startResponse = await ec2.startInstances({
                InstanceIds: [instanceId],
            }).promise();

            console.log(`Instance ${instanceId} is starting. Current state:`, startResponse.StartingInstances);
        } else {
            console.error(`Instance ${instanceId} is not in a stopped state. Current state: ${currentState}`);
        }
    } catch (error) {
        console.error("Error starting the instance:", error);
        throw error;
    }
};
