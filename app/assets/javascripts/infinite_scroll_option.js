$(document).on("turbolinks:load ajax:success", function () {
  // 次へのリンクがあったら無限スクロールする
  if ($("nav.pagination a[rel=next]").length) {
    $(".item-list").infiniteScroll({
      append: '.item-list .item-card',
      button: '.loadmore-btn',
      history: false,
      path: 'nav.pagination a[rel=next]',
      status: '.page-load-status',
      hideNav: 'nav.pagination',
      scrollThreshold: false,
    })
  }

  // ページネーションするほどなかったらさらに表示ボタンを非表示にする
  if (!$('.pagination').length) {
    $('.loadmore-btn').hide()
  }
});
