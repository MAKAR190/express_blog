const express = require('express');
const { Comment } = require('../models')
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newComment = await Comment.create(req.body);
        res.json(newComment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put('/:commentId', async (req, res) => {
    try {
        const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true, });
        res.json(updatedComment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.patch('/:commentId/like', async (req, res) => {
    try {
            const updatedComment = await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true, });
            res.json(updatedComment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete('/:commentId', async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.json({ message: `Comment with id ${req.params.commentId} was deleted` });
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

module.exports = router;