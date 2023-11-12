var countDownDate = new Date("Nov 20, 2023 15:00:00").getTime();

var x = setInterval(function() {

  var now = new Date().getTime();
//   console.log(now);

  var timeDifference = countDownDate - now;

  var days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  var hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // Display the result in the element with id="demo"
  document.getElementById("timer").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (timeDifference < 0) {
    clearInterval(x);
    document.getElementById("timer").innerHTML = "EXPIRED";
  }
}, 1000);

function sendMail(){
    var subject = document.getElementById("subject").value;
    var message = document.getElementById("message").value;
    window.location.href = "mailto:navaneethjainsl@gmail.com?subject=" + subject + "&body=" + message;
}