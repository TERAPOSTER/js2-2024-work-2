// 授業を追加する関数
function addClassTime(day, period, subject, classroom) {
  const timetableBody = document.querySelector('#timetable-body');
  const rows = timetableBody.querySelectorAll('tr');
  
  // 対応する曜日と時間帯に授業を追加
  const dayIndex = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'].indexOf(day) + 1;
  const row = rows[period - 1]; // periodは1限、2限、... に対応
  const cell = row.querySelectorAll('td')[dayIndex];
  
  // セルに授業名と教室番号を追加
  cell.innerHTML = `<div><strong>${subject}</strong><br><span>${classroom}</span></div>`;
  
  cell.addEventListener('click', function() {
    if (confirm('この授業を削除しますか？')) {
      cell.innerHTML = ''; // セルの内容を削除
    }
  });
}

// フォームの送信イベントを処理
document.querySelector('#add-class-form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const day = document.querySelector('#day').value;
  const period = parseInt(document.querySelector('#period').value, 10);
  const subject = document.querySelector('#subject').value;
  const classroom = document.querySelector('#classroom').value;

  // 入力内容で授業を追加
  addClassTime(day, period, subject, classroom);
  
  // フォームをリセット
  document.querySelector('#add-class-form').reset();
});