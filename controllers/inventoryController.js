const { Item } = require('../models/Item');

async function getItems(req, res) {
    try {
        const items = await Item.getAll();
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve inventory items' });
    }
}

async function addItem(req, res) {
    const { item_name, category, quantity, unit_price } = req.body;
    try {
        const id = await Item.create(item_name, category, quantity, unit_price);
        res.status(201).json({ message: 'Item created', id });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add new item' });
    }
}

async function updateItem(req, res) {
    const { id } = req.params;
    const { item_name, category, quantity, unit_price } = req.body;
    try {
        await Item.update(id, item_name, category, quantity, unit_price);
        res.json({ message: 'Item updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update item' });
    }
}

async function deleteItem(req, res) {
    const { id } = req.params;
    try {
        await Item.delete(id);
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
}

module.exports = { getItems, addItem, updateItem, deleteItem };