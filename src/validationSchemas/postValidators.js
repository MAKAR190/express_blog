const yup = require('yup')

exports.create = yup.object().shape({
    thumbnailUrl: yup.string().optional(),
    title: yup.string().required(),
    body: yup.string().required(),
    usersReading: yup.number(),
    usersLiked: yup.number(),
    views: yup.number(),
    tags: yup.string(),
    comments: yup.array(),
    author: yup.string(),
})