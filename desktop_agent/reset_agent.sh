#!/bin/bash
# Reset Hospital Agent Configuration for Testing

CONFIG_DIR="$HOME/.fedral"
CONFIG_FILE="$CONFIG_DIR/hospital_config.json"

echo "Looking for config at: $CONFIG_FILE"

if [ -f "$CONFIG_FILE" ]; then
    rm "$CONFIG_FILE"
    echo "✅ Success: Hospital Agent configuration has been reset."
    echo "Next time you launch the agent, it will show the Welcome Wizard."
else
    echo "ℹ️ Note: No configuration file found. Agent is already in a clean state."
fi
