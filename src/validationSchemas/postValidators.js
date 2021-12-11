const yup = require('yup')

exports.create = yup.object().shape({
    thumbnailUrl: yup.string().optional(),
    title: yup.string(),
    body: yup.string(),
    usersReading: yup.number(),
    usersLiked: yup.number(),
    views: yup.number(),
    tags: yup.array(),
    comments: yup.array(),
    author: yup.string(),
})