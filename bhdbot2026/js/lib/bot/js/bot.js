$(function () {
    let $form = $("#msgForm"),
    $newMsg = $form.find("input"),
    $sendBtn = $form.find("button"),
    $feed = $("#msgs"),
    _wait = ms => new Promise((r, j) => setTimeout(r, ms)), // See [0]
    _secs = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  

    var _send = data => {
      let $msg = $('<div class="msg"></div>'),
      { sender, typing } = data;
      if (sender !== "me") {
        $msg.addClass("to");
      } else {
        $msg.addClass("from");
      }
      $msg.text(data.msg);
      if (typing) $msg.addClass("typing");
      $msg.appendTo($feed);
      $newMsg.val("");
      if (sender === "me") setTimeout(_agentReply, 1000);
      if (typing) return $msg; // ref to new DOM .msg
    };
  
  
    var _agentReply = () => {
      let waitAfew = _wait(_secs(3000, 5000)),
      showAgentTyping = async () => {
        console.log("agent is typing...");
        let $agentMsg = _send({ msg: "Agent is typing...", typing: true, sender: false });
        waitAfew.then(() => {
          $agentMsg.text("Lorem ipsum dolor sit amet.");
          $agentMsg.removeClass("typing");
        });
  
      };
      waitAfew.then(showAgentTyping());
    };
  
    $newMsg.on("keypress", function (e) {
      if (e.which === 13) {
        e.stopPropagation();e.preventDefault();
        let theEnvelope = {
          msg: $newMsg.val(),
          sender: "me" };
        return _send(theEnvelope);
      } else {
        // goggles
      }
    });

    $sendBtn.on("click", function (e) {
      // Stop the prop
      e.stopPropagation();
      e.preventDefault();
      // Wrap the msg and send!
      let theEnvelope = {
        msg: $newMsg.val(),
        sender: "me"
        };
  
      return _send(theEnvelope);
    });
  });