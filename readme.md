# Train Search Chatbot Setup & Logic

## Starting the Application

1. Clone the repo and Open terminal in the root folder of the project.

2. Make the script executable:
```bash
chmod u+x start.sh
```

3. Run the script:
```bash
./start.sh
```

> **Note**: Click "Initialize Train Data" Button found on the homepage on first
> run to populate the database. This will use a csv file included in the project
> and seed the db.

## Chat Response Logic

The chatbot understands the following query patterns:

1. **Route Search**: "from [city1] to [city2]"
   ```
   Example: "show trains from Delhi to Mumbai"
   ```
   - Finds trains between specified stations
   - Only first "from" and "to" are considered

2. **Departure Search**: "from [city]"
   ```
   Example: "trains from Delhi"
   ```
   - Lists trains departing from the station

3. **Arrival Search**: "to [city]"
   ```
   Example: "trains to Mumbai"
   ```
   - Lists trains arriving at the station

4. **General Search**: Any word with 4+ characters
   ```
   Example: "Rajdhani Express"
   ```
   - Searches train names, numbers, and stations


## Common Queries
- "Show trains from Delhi to Mumbai"
- "Trains starting from Chennai"
- "Trains going to Kolkata"
- "Express trains"
- "Show Rajdhani trains"

The chatbot returns up to 10 matching trains per query.
