var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mongoose = require('mongoose');
var Movie = require('./models/movie.js');
var User=require('./models/user.js');

var port = process.env.PORT || 3000;
//��������Ҫ��������PORT����ô���û���������PORT���������ʹ����������ָ���˿ںţ�PORT=8080 node app.js
var app = express();
//Ӧ�ü��м���͵������м��

mongoose.connect('mongodb://localhost:27017/movie')////���movie�൱�����ݿ���
mongoose.connection.on('connected', function () {
  console.log('Connection success!');
});

//������ͼλ�ú���ͼ����
//mongoose.Promise = global.Promise;
app.set('views', './views/pages');
app.set('view engine', 'jade');


/*
app.use(express.static('public'));//ָ����̬��ҳĿ¼,�������������HTML�ļ�����ʱ���������˾͵�publicĿ¼Ѱ������ļ�

�磺<link href="/bootstrap/css/bootstrap.css" rel="stylesheet">, �������˾͵�public/bootstrap/css/Ŀ¼��Ѱ��bootstrap.css�ļ�
*/
app.use(express.static(path.join(__dirname, 'public')));

/**
bodyParser.urlencoded(options) options��ѡ���������Ҳ����һ���м��������м����������body�е�urlencoded�ַ��� ֻ֧��utf-8�ı�����ַ���
*/
//ÿһ�����󶼻���һ���м��
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
      title: '��ҳ',
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
      title: '����ҳ' + movie.title,
      movie: movie
    });
  });

});
//admin
app.get('/admin/movie', function (req, res) {
  res.render('admin', {
    title: '��̨¼��',
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
:����·������
app.get("/hello/:who", function(req, res) {
  res.end("Hello, " + req.params.who + ".");
});//��"/hello/alice����ַ����ַ�е�alice����������Ϊreq.params.who���Ե�ֵ
*/
app.get('/admin/update/:id', function (req, res) {
  var id = req.params.id;
  if (id) {
    Movie.findById(id, function (err, movie) {
      res.render('admin', {
        title: '��̨����',
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
      _movie = _.extend(movie, movieObj);//���¶���
      _movie.save(function (err, movie) {
        if (err) {
          console.log(err)
        }
        res.redirect('/movie/' + movie._id)//�ض����൱����ת
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
      console.log("û��ע����˺�");
      res.redirect('/');
      return;
    }else{
      console.log("��¼�ɹ�");
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
      title: '�б�',
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
      title:"����Ա�б�",
      users:users
    })
  })
})

//delete
//.app.delete("/", middleware);//http��deleteʱ������·��/�Ĵ���
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


