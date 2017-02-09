*req.param获取pathinfo中参数 /api/users/:id
*req.query获取查询参数 /api/users?name=wwx
*req.body获取form提交参数
*解析body不是nodejs默认提供的，你需要载入body-parser中间件才可以使用req.body，此方法通常用来解析POST请求中的数据



