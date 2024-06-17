const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const User = require('./models/user');
const Order = require('./models/order');
const nodemailer = require('nodemailer');
const path = require('path');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://dzedunmao346:tAkt4hGMuxelXdcc@grantapp.y4yzhdu.mongodb.net/?retryWrites=true&w=majority&appName=grantapp', {
  //useNewUrlParser: true,
  //useUnifiedTopology: true,
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/register', async (req, res) => {
    const { username, password, firstName, lastName } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, firstName, lastName });
        await user.save();
        
        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered', token });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user', error });
    }
});

app.post('/login', async (req, res) => {
    const { username, password, firstName, lastName } = req.body;
    console.log('Login attempt:', username, password, firstName, lastName); // Логирование входных данных

    try {
        if (username === 'root' && password === '12345') {
            const token = jwt.sign({ isAdmin: true }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token, isAdmin: true });
        } else {
            const user = await User.findOne({ username, firstName, lastName });
            console.log('Found user:', user); // Логирование найденного пользователя

            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            console.log('Password match:', isMatch); // Логирование результата проверки пароля

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
            res.json({ token, isAdmin: false });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// app.js
app.post('/order', async (req, res) => {
    const { token, product, productos, quantity, phoneNumber, email } = req.body;
    try {
        const decoded = jwt.verify(token, 'your_jwt_secret');
        const userId = decoded.userId;

        // Получаем данные пользователя из базы данных по его идентификатору
        const user = await User.findById(userId);

        // Проверяем, найден ли пользователь
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Создаем заказ и добавляем данные пользователя к заказу
        const order = new Order({ 
            userId, 
            product,
            productos,
            quantity, 
            phoneNumber, 
            email, 
            lastName: user.lastName, 
            firstName: user.firstName,
            username: user.username
        });

        // Сохраняем заказ в базу данных
        await order.save();

        res.status(201).json({ message: 'Order placed' });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Error placing order', error });
    }

});


app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'firstName lastName username');
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders', error });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
