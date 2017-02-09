$(function () {
  $('.del').click(function (e) {
    var target = $(e.target),
      id = target.data('id'),
      //button.btn.btn-danger.del(type="button", data-id="#{item._id}") 删除
      tr = $('.item-id-' + id);
      //tr(class="item-id-#{item._id}")
    $.ajax({
        type: 'DELETE',
        url: '/admin/list?id=' + id
      })
      .done(function (results) {//成功以后
        if (results.success === 1) {
          if (tr.length > 0) {
            tr.remove()
          }
        }
      })
  })
})
