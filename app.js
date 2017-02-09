var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mongoose = require('mongoose');
var Movie = require('./models/movie.js');
var User=require('./models/user.js');

var port = process.env.PORT || 3000;
//环境变量要是设置了PORT，那么就用环境变量的PORT。比如可以使用下面命令指定端口号：PORT=8080 node app.js
var app = express();
//应用级中间件和第三方中间件

mongoose.connect('mongodb://localhost:27017/movie')////这个movie相当于数据库名
mongoose.connection.on('connected', function () {
  console.log('Connection success!');
});

//设置视图位置和视图引擎
//mongoose.Promise = global.Promise;
app.set('views', './views/pages');
app.set('view engine', 'jade');


/*
app.use(express.static('public'));//指定静态网页目录,当浏览器发出非HTML文件请求时，服务器端就到public目录寻找这个文件

如：<link href="/bootstrap/css/bootstrap.css" rel="stylesheet">, 服务器端就到public/bootstrap/css/目录中寻找bootstrap.css文件
*/
app.use(express.static(path.join(__dirname, 'public')));

/**
bodyParser.urlencoded(options) options可选，这个方法也返回一个中间件，这个中间件用来解析body中的urlencoded字符， 只支持utf-8的编码的字符。
*/
//每一个请求都会走一次中间件
app.use(bodyParser.urlencoded({
  extended: true
}));


var cookieParser = require('cookie-parser') 
var session = require('express-session') 
  
app.use(cookieParser()) 
app.use(session({ 
    secret: 'movie'
}))


app.locals.moment = require('moment');
app.listen(port, function () {
  console.log('server start on port:' + port);
});


//routes
//index
app.get('/', function (req, res) {
  console.log('user in session');
  console.log(req.session.user);
  Movie.fetch(function (err, movies) {
    if (err) {
      console.log(err)
    }
    res.render('index', {
      title: '首页',
      movies: movies
    });
  });
});

//detail
app.get('/movie/:id', function (req, res) {
  var id = req.params.id;
  Movie.findById(id, function (err, movie) {
    if (err) {
      console.log(err)
    }
    res.render('detail', {
      title: '详情页' + movie.title,
      movie: movie
    });
  });

});
//admin
app.get('/admin/movie', function (req, res) {
  res.render('admin', {
    title: '后台录入',
    movie: {
      title: '',
      doctor: '',
      country: '',
      language: '',
      summary: '',
      year: '',
      flash: '',
      poster: ''
    }
  });
});

/**
:捕获路径内容
app.get("/hello/:who", function(req, res) {
  res.end("Hello, " + req.params.who + ".");
});//如"/hello/alice”网址，网址中的alice将被捕获，作为req.params.who属性的值
*/
app.get('/admin/update/:id', function (req, res) {
  var id = req.params.id;
  if (id) {
    Movie.findById(id, function (err, movie) {
      res.render('admin', {
        title: '后台更新',
        movie: movie
      });
    });
  }
});
app.post('/admin/movie/new', function (req, res) {
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _movie;
  if (id !== 'undefined') {
    Movie.findById(id, function (err, movie) {
      if (err) {
        console.log(err);
      }
      _movie = _.extend(movie, movieObj);//更新对象
      _movie.save(function (err, movie) {
        if (err) {
          console.log(err)
        }
        res.redirect('/movie/' + movie._id)//重定向，相当于跳转
      })
    })
  } else {
    _movie = new Movie({
      doctor: movieObj.doctor,
      title: movieObj.title,
      language: movieObj.language,
      country: movieObj.country,
      year: movieObj.year,
      poster: movieObj.poster,
      flash: movieObj.flash,
      summary: movieObj.summary,
    })
    _movie.save(function (err, movie) {
      if (err) {
        console.log(err);
      }
      res.redirect('/movie/' + movie._id)
    })
  }
})

app.post('/user/signup',function(req,res){
  var _user=req.body.user;
  // console.log(_user);
  var user=new User(_user);
  User.find({name:_user.name},function(err,user){
    if (err) {
      console.log(err);
    }
    if (user) {
      res.redirect('/');
      return;
    }else{
      user.save(function(err,user){
        if (err) {
          console.log(err);
        }else{
          console.log(user);
        }
        res.redirect('/admin/userlist')
      })
    }
  })
})

app.post('/user/signin',function(req,res){
  var _user=req.body.user;
  var name=_user.name;
  var password=_user.password;

  User.findOne({name:name,password:password},function(err,user){
    if(err){
      console.log(err);
    }
    if (!user) {
      console.log("没有注册该账号");
      res.redirect('/');
      return;
    }else{
      console.log("登录成功");
      req.session.user=user;
      res.redirect('/');
      return;
    }
  })
})

//list
app.get('/admin/list', function (req, res) {
  Movie.fetch(function (err, movies) {
    if (err) {
      console.log(err);
    }
    res.render('list', {
      title: '列表',
      movies: movies
    });
  })
});

app.get('/admin/userlist',function(req,res){
  User.fetch(function(err,users){
    if (err) {
      console.log(err);
    }
    res.render('userlist',{
      title:"管理员列表",
      users:users
    })
  })
})

//delete
//.app.delete("/", middleware);//http中delete时，对于路径/的处理
app.delete('/admin/list', function (req, res) {
  var id = req.query.id
  if (id) {
    Movie.remove({
      _id: id
    }, function (err, movie) {
      if (err) {
        console.log(err);
      } else {
        res.json({
          success: 1
        })
      }
    })
  }
})


