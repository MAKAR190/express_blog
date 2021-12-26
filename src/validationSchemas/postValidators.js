const yup = require('yup')

exports.create = yup.object().shape({
    thumbnailUrl: yup.string().optional(),
    title: yup.string().required(),
    body: yup.string().required(),
    tags: yup.string()
})