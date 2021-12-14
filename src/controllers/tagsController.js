const { Tag } = require('../models');

exports.getTags = async (req, res) => {
try {
    const { search } = req.query;
    const tags = await Tag.find({
    name: {
        $regex: search,
        $options: "i",
    },
    });

    res.json(tags);
} catch (error) {
    console.log(error);
    res.status(500).send(error);
}
};