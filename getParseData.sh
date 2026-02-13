#!/bin/bash

# Configuration
OUTPUT_FILE="data-model.md"
BASE_URL="https://dev.parse.markidiags.com"
APP_ID="marki"
MASTER_KEY="Shaky4-Exception6"

# Clear the output file
> "$OUTPUT_FILE"

# Function to make a GET request and save the response
get_class_data() {
    local class_name="$1"
    echo "Fetching data for class: $class_name"
    
    # Add class name header to output file
    echo "

# $class_name" >> "$OUTPUT_FILE"
    echo "
\`\`\`json" >> "$OUTPUT_FILE"
    
    # Make the curl request and append to output file
    curl -X GET \
        -H "X-Parse-Application-Id: $APP_ID" \
        -H "X-Parse-Master-Key: $MASTER_KEY" \
        -G \
        --data-urlencode "limit=5" \
        "${BASE_URL}/classes/${class_name}" >> "$OUTPUT_FILE"
    
    # Close the code block
    echo "
\`\`\`" >> "$OUTPUT_FILE"
}

# First, get the schema information
echo "Fetching schema information..."
echo "# Parse Server Schema" > "$OUTPUT_FILE"
echo "
\`\`\`json" >> "$OUTPUT_FILE"

curl -X GET \
    -H "X-Parse-Application-Id: $APP_ID" \
    -H "X-Parse-Master-Key: $MASTER_KEY" \
    "${BASE_URL}/schemas" >> "$OUTPUT_FILE"

echo "
\`\`\`" >> "$OUTPUT_FILE"

# Extract class names from the schema response and fetch data for each
# We'll use jq to parse the JSON if available, otherwise use grep/sed
echo "Processing class names..."

# Check if jq is available
if command -v jq &> /dev/null; then
    # Use jq to extract class names
    CLASS_NAMES=$(curl -s -X GET \
        -H "X-Parse-Application-Id: $APP_ID" \
        -H "X-Parse-Master-Key: $MASTER_KEY" \
        "${BASE_URL}/schemas" | jq -r '.results[].className')
else
    # Fallback: use grep and sed to extract class names (less reliable)
    echo "jq not found, using fallback method to extract class names..."
    CLASS_NAMES=$(curl -s -X GET \
        -H "X-Parse-Application-Id: $APP_ID" \
        -H "X-Parse-Master-Key: $MASTER_KEY" \
        "${BASE_URL}/schemas" | grep -o '"className"[^,]*"[^"]*"' | sed 's/.*"className":"\([^"]*\)".*/\1/')
fi

# Process each class name
for class in $CLASS_NAMES; do
    # Skip system classes if you want by adding grep -v "^_" 
    # but we'll include them for completeness
    get_class_data "$class"
done

echo "Data collection complete. Results saved to $OUTPUT_FILE"