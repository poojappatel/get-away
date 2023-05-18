const express = require('express');
const app = express();
const DataInterface = require('./backend/data-interface.js');

let manager = new DataInterface();

// middleware that puts incoming data into req.body
app.use(express.json());

// serves static files of the homepage to browser
app.use('/', express.static('frontend'));

app.post('/initial-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        let results = await manager.getFlights(package);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/lodging-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        // res.send(package);
        let results = await manager.getLodging(package);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/entertainment-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        let results = await manager.getEntertainment(package);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/restaurant-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        let results = await manager.getRestaurants(package);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/rentalCar-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        // res.send(package);
        let results = await manager.getRentalCars(package);
        console.log(results);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/uberlyft-preferences', async (req, res) => {
    try 
    {
        let package = req.body;
        // res.send(package);
        let results = await manager.getUberLyft(package);
        res.send(results);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/load-summary', async (req, res) => {
    try 
    {
        let package = req.body;
        let tripID = package.id
        let results = await manager.getTrip(tripID)
        res.send(JSON.stringify(results));
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.post('/create-trip', async (req, res) => {
    try 
    {
        let package = req.body;
        let results = await manager.createTrip(package);
        if (results == false) {
            throw Error()
        }
        let string = JSON.stringify({'id': results})
        res.send(string);
    } 
    catch(error) 
    {
        console.error("ERROR IN FETCHING DATA: ", error);
        res.status(500).send("ERROR IN FETCHING DATA!");
    }
});

app.listen(3000, async () => {
    // await manager.initDatabase()
    
    console.log("Server started on port 3000");
});