$(document).ready(function () {
    // 監聽側邊欄連結的點擊事件
    $('.sidebar a').click(function () {
      // 觸發 navbar-toggler 按鈕的點擊事件
      $('.navbar-toggler').click();
    });

    // 監聽 sidebarNav 的展開事件
    $('#sidebarNav').on('show.bs.collapse', function () {
      // 切換 navbar-toggler-icon 的類別，讓圖示變成 X
      $('.navbar-toggler-icon').removeClass('navbar-toggler-icon').addClass('navbar-toggler-icon-x');
    });

    // 監聽 sidebarNav 的折疊事件
    $('#sidebarNav').on('hide.bs.collapse', function () {
      // 切換 navbar-toggler-icon 的類別，還原原來的圖示
      $('.navbar-toggler-icon-x').removeClass('navbar-toggler-icon-x').addClass('navbar-toggler-icon');
    });
  });
  
