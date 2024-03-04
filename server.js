import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import cors from 'cors';
import bcrypt from 'bcrypt';
import path from 'path';

const DATABASE_URL = "mongodb+srv://NEAReport:dVwR6bsw6JEfYcNZ@cluster0.ix9zlgt.mongodb.net/dentaview?retryWrites=true&w=majority";
const PORT = 8080;

const { Schema, model } = mongoose;

const dbName = "dentaview";
const collectionName = "registrations";

mongoose.connect(DATABASE_URL, { dbName: dbName });

mongoose.connection
    .on('connected', () => console.log('Connected to MongoDB'))
    .on('error', (error) => console.error('Error connecting to MongoDB:', error))
    .on('disconnected', () => console.log('Disconnected from MongoDB'));


const RegisterSchema = new Schema(
    {
        email: {
            type: String,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        }
    },
    { _id: false }
);

const Register = model('registers', RegisterSchema);

const BookingSchema = new Schema({
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, { collection: 'Appointments' });

const Booking = model('Booking', BookingSchema);



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));

// Enable CORS middleware
app.use(cors());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(morgan('dev'));
app.use(express.static('public'));



app.get('/', (req, res) => {
    res.render('HomePage');
});

app.get('/login', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/calendar', (req, res) => {
    res.render('calendar.ejs');
});

app.get('/booking', (req, res) => {
    res.render('booking.ejs');
});

app.post('/register', async (req, res) => {
    try {
        const data = {
            email: req.body.useremail,
            password: req.body.userpassword
        };

        // Check if the password is at least 8 characters long
        if (data.password.length < 8) {
            return res.render('register', { errorMessage: "Password must be at least 8 characters long" });
        }

        // Check if the user already exists in the database
        const existingUser = await Register.findOne({ email: data.email });
        if (existingUser) {
            return res.render('register', { errorMessage: "User already exists, please try a new email" });
        } else {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(data.password, saltRounds);

            data.password = hashedPassword;

            const userdata = await Register.insertMany(data);
            console.log(userdata);
            return
        }
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).send("Error registering user");
    }
});



app.post("/login", async (req, res) => {
    try {
        const data = {
            email: req.body.useremail,
            password: req.body.userpassword
        };
        const check = await Register.findOne({ email: req.body.useremail })
        if (!check) {
            return res.render('index', { errorMessage: "Username can't be found!" });

        }

        const isPaswordMatch = await bcrypt.compare(req.body.userpassword, check.password);
        if (isPaswordMatch) {
            res.redirect("/calendar")
        } else {
            // return res.send({ errorMessage: "Incorrect Password , try again!" });
            return res.render('calendar', { errorMessage: "xxxxx" });

        }
    } catch {
        return res.render('index', { errorMessage: "Wrong Details entered!" });

    }
});

app.post('/booking', async (req, res) => {
    try {
        const { date, time, name, email, phone, notes } = req.body;

        const booking = new Booking({
            date,
            time,
            name,
            email,
            phone,
            notes
        });

        await booking.save();
        res.send('booking', { errorMessage: "Booking confirmed!" });

    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).send("Error booking appointment");
    }
});


app.get('/calendar', async (req, res) => {
  try {
      // Retrieve data from appointments collection
      const data = await Booking.find({});
      // Render EJS template with retrieved data
      res.render('calendar', { data });
  } catch (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from MongoDB');
  }
});



app.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));
