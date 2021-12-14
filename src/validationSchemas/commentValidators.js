const yup = require('yup')

exports.create = yup.object().shape({
    text: yup.string(),
    author: yup.string(),
    parentPost: yup.string(),
    parentComment: yup.string().optional(),
    likes: yup.number(),
})