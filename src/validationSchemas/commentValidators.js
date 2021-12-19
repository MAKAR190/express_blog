const yup = require("yup");

exports.create = yup.object().shape({
  text: yup.string().required(),
  author: yup.string().required(),
  parentPost: yup.string().required(),
  parentComment: yup.string().optional(),
  likes: yup.number(),
});
