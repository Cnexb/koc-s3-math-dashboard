/* JM23 comics — 3 concept parts. Part 1 pictures regenerated 20260827. */
(function () {
  "use strict";

  var V = "20260828-p1v5";

  function comicsDir() {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute("src") || "";
      if (src.indexOf("s2-areas-volumes-ii-comics.js") >= 0) {
        return src.replace(/s2-areas-volumes-ii-comics\.js.*$/, "comics/");
      }
    }
    return "comics/";
  }

  var DIR = comicsDir();
  function img(name) { return DIR + name + "?v=" + V; }
  function m(tex) { return "\\(" + tex + "\\)"; }

  var DATA = {
    parts: [
      {
        id: "part1",
        title: "Circumference & arcs",
        chapter: "Circumferences and arc lengths of circles",
        pages: [
          {
            id: "staff",
            title: "Sports Day staff",
            image: img("p1-01-staff.png"),
            text:
              "[畫面] 陸運會前一晚的操場. 陳老師把工作人員證件遞給阿樂和美心. 遠處有人在搬欄架、掛橫額.\n\n" +
              "**陳老師:** 明日陸運會, 數學學會要負責場地.\n" +
              "Mr Chan: Sports Day is tomorrow. Maths Club is in charge of the venue.\n\n" +
              "**阿樂:** 我們是工作人員? 我只想著要去跑八百米.\n" +
              "Ah Lok: We're staff? I was only thinking about running the 800.\n\n" +
              "**美心:** 趁還沒到開賽時間, 先幫忙準備場地.\n" +
              "Mei Sum: Before the races start, let's help set up the field first.\n\n" +
              "**陳老師:** 快戴上證件, 早點弄好就能早點準備明日的比賽.\n" +
              "Mr Chan: Put your badges on. Finish early, and you'll still have time to get ready for tomorrow's races.",
          },
          {
            id: "magic",
            title: "Not magic",
            image: img("p1-02-magic.png"),
            text:
              "[畫面] 兩人用圓規在跑道旁畫熱身圈, 才畫了四分一. 圓規一轉, 圓圓彈出來. 阿樂先嚇得喊出「魔法」.\n\n" +
              "**阿樂:** (嚇得後退) 魔法!? 圓規成精了!\n" +
              "Ah Lok: (jumps back) Magic!? The compass came alive!\n\n" +
              "**美心:** 你... 你是誰?\n" +
              "Mei Sum: Who... are you?\n\n" +
              "**圓圓:** 不是魔法啦, 我是圓圓, 是圓本身. 你們看看這條熱身圈.\n" +
              "Circle: Not magic. I'm Circle — I'm the circle itself. Look at this warm-up loop.\n\n" +
              "**陳老師:** 這條路是圓周. 一旦定下半徑, 就決定了這圈有多長.\n" +
              "Mr Chan: This path is the circumference. Once you set the radius, you set how long this loop is.",
          },
          {
            id: "formula-C",
            title: "The cord is the lap",
            image: img("p1-03-cord.png"),
            text:
              "[畫面] 頒獎台後台. 阿樂把一條 " + m("30\\text{ cm}") + " 的彩繩在桌上圍成一圈, 圓圓站在圓心.\n\n" +
              "**阿樂:** 這條繩圍一圈最大就這麼大, 一點都不剩了.\n" +
              "Ah Lok: Loop this cord once and this is as big as it gets. Nothing left over.\n\n" +
              "**美心:** 所以繩有多長, 這個圓走一圈就有多長?\n" +
              "Mei Sum: So however long the cord is, that's how long one lap of this circle is?\n\n" +
              "**圓圓:** 沿我走一圈要走: " + m("30\\text{ cm}") + ", 所以周長就是 " + m("30\\text{ cm}") + ".\n" +
              "Circle: Walk around me once: " + m("30\\text{ cm}") + ", so the circumference is " + m("30\\text{ cm}") + ".\n\n" +
              "**陳老師:** 繩長就是周界 " + m("C") + ".\n" +
              "Mr Chan: The cord is circumference " + m("C") + ".\n\n" +
              m("C=2\\pi r"),
          },
          {
            id: "formula-r",
            title: "Turn the formula around",
            image: img("p1-04-radius.png"),
            text:
              "[畫面] 同一條繩. 白板上寫 Change the subject to find the radius. (C = 2πr 只出現在上一頁.)\n\n" +
              "**阿樂:** 可是我們只量了繩長 " + m("30\\text{ cm}") + ", 半徑還沒量... 花環會不會細得像手鏈?\n" +
              "Ah Lok: We only measured the cord — " + m("30\\text{ cm}") + ". We haven't measured the radius... will the wreath be as small as a bracelet?\n\n" +
              "**美心:** 倒過來.\n" +
              "Mei Sum: Turn it around.\n\n" +
              "**美心:** Change the subject to find the radius.\n" +
              "Mei Sum: Change the subject to find the radius.\n\n" +
              "**美心:** 半徑大概四厘米多, 真的只夠做小花環.\n" +
              "Mei Sum: A bit over four centimetres. Yeah — only a tiny wreath.\n\n" +
              "**陳老師:** 直徑就是\n" +
              "Mr Chan: The diameter is\n\n" +
              m("2r\\approx 9.55\\text{ cm}") + "\n\n" +
              "**陳老師:** 不會太細的.\n" +
              "Mr Chan: It won't be too thin.",
            checks: [
              {
                id: "p1q-C",
                prompt:
                  "A circle has radius " + m("6\\text{ cm}") +
                  ". Find its circumference (" + m("3") + " s.f.).",
                choices: [
                  m("37.7\\text{ cm}"),
                  m("18.8\\text{ cm}"),
                  m("12.0\\text{ cm}"),
                  m("113\\text{ cm}"),
                ],
                answer: 0,
                explain: m("C=2\\pi r=12\\pi\\approx 37.7\\text{ cm}") + ".",
              },
              {
                id: "p1q-r",
                prompt:
                  "A cord of length " + m("50\\text{ cm}") +
                  " is bent into a circle. Find the radius (" + m("3") + " s.f.).",
                choices: [
                  m("7.96\\text{ cm}"),
                  m("15.9\\text{ cm}"),
                  m("25.0\\text{ cm}"),
                  m("50.0\\text{ cm}"),
                ],
                answer: 0,
                explain:
                  "The cord is the circumference, so " +
                  m("r=C/(2\\pi)=50/(2\\pi)\\approx 7.96\\text{ cm}") + ".",
              },
            ],
          },
          {
            id: "hoops",
            title: "Hula hoop challenge",
            image: img("p1-05-hoops.png"),
            text:
              "[畫面] 遊園「呼拉圈挑戰」. 阿樂轉金圈轉得很吃力; 紅圈在地上.\n\n" +
              "**阿樂:** 你們快看這個金圈好難轉, 一定大了很多!\n" +
              "Ah Lok: Look at this gold hoop — it's so hard to spin. It must be a lot bigger!\n\n" +
              "**美心:** 紅圈半徑 " + m("10\\text{ cm}") + ", 金圈比紅圈多了 " + m("4\\text{ cm}") + ".\n" +
              "Mei Sum: The red hoop has radius " + m("10\\text{ cm}") + ". The gold one is " + m("4\\text{ cm}") + " more than the red.\n\n" +
              "**陳老師:** 先比較兩圈半徑, 再求周界.\n" +
              "Mr Chan: Compare the two radii first, then find the circumferences.\n\n" +
              "**阿樂:** 金圈半徑多了 " + m("4\\text{ cm}") + ", 所以周界長了 " +
              m("4\\times 2\\pi=8\\pi\\approx 25.1\\text{ cm}") + "... 難怪沉了這麼多!\n" +
              "Ah Lok: The gold radius is " + m("4\\text{ cm}") + " more, so the circumference is " +
              m("4\\times 2\\pi\\approx 25.1\\text{ cm}") + " longer... no wonder it feels so much heavier!",
          },
          {
            id: "coin",
            title: "The coin stall",
            image: img("p1-06-coin.png"),
            text:
              "[畫面] 滾硬幣攤, 旁邊有慢踏單車. 美心把一枚半徑 " + m("11\\text{ mm}") + " 的硬幣彈出; 圓圓在後面追.\n\n" +
              "**美心:** 這個攤要你把硬幣滾到終點. 我滾了三十圈, 它走得好遠!\n" +
              "Mei Sum: This stall wants you to roll a coin to the finish. I gave it thirty turns and it went so far!\n\n" +
              "**阿樂:** 硬幣那麼小, 怎會走那麼遠?\n" +
              "Ah Lok: It's such a tiny coin. How did it go that far?\n\n" +
              "**美心:** 每滾一圈就走一次自己的周界, 三十圈就是 " + m("30\\times 2\\pi r=60\\pi r") + ".\n" +
              "Mei Sum: Each roll travels its own circumference once. Thirty rolls is " + m("30\\times 2\\pi r=60\\pi r") + ".\n\n" +
              "**圓圓:** 車輪、呼拉圈、硬幣, 都一樣: 轉一圈, 就走 " + m("2\\pi r") + ".\n" +
              "Circle: Wheels, hoops, coins — same idea. One turn walks " + m("2\\pi r") + ".\n\n" +
              "**阿樂:** 我量過, 輪的半徑是半米, " + m("C=\\pi\\text{ m}") + ", 所以大約 32 圈.\n" +
              "Ah Lok: I measured. The wheel's radius is half a metre, " + m("C=\\pi\\text{ m}") + ", so about 32 turns.",
            checks: [
              {
                id: "p1q-roll",
                prompt:
                  "A wheel of radius " + m("0.4\\text{ m}") +
                  " rolls without slipping for " + m("50\\text{ m}") +
                  ". How many revolutions? (nearest integer)",
                choices: [m("20"), m("10"), m("40"), m("50")],
                answer: 0,
                explain:
                  "One revolution covers " + m("C=2\\pi r=0.8\\pi\\text{ m}") +
                  ". Revolutions " + m("=50/(0.8\\pi)\\approx 19.9\\approx 20") + ".",
              },
            ],
          },
          {
            id: "arc",
            title: "The unfinished loop",
            image: img("p1-07-arc.png"),
            checks: [
              {
                id: "p1q-arc",
                prompt:
                  "An arc of " + m("120^\\circ") +
                  " has radius " + m("9\\text{ cm}") +
                  ". Find its length (leave " + m("\\pi") + " in the answer).",
                choices: [
                  m("6\\pi\\text{ cm}"),
                  m("18\\pi\\text{ cm}"),
                  m("3\\pi\\text{ cm}"),
                  m("12\\pi\\text{ cm}"),
                ],
                answer: 0,
                explain:
                  "Arc length " +
                  m("=(120/360)\\times 2\\pi r=\\tfrac{1}{3}\\times 18\\pi=6\\pi\\text{ cm}") +
                  ".",
              },
            ],
            text:
              "[畫面] 兩人走回跑道旁. 熱身圈只畫了四分一 (90° 弧), 圓規還插在草上, 張開 5 m. 圓圓站在圓心.\n\n" +
              "**阿樂:** 熱身圈才畫了四分一, 圓規跳出來之後就沒畫完.\n" +
              "Ah Lok: We only drew a quarter of the warm-up loop. After the compass jumped out, we stopped.\n\n" +
              "**美心:** 這一段是彎的, 不是整圈. 粉筆還要再畫多長?\n" +
              "Mei Sum: This bit is curved, not a full loop. How much more chalk do we still need?\n\n" +
              "**陳老師:** 整圈是 " + m("2\\pi r") + ". 你們只畫了 " + m("90^\\circ") + ", 就是整圈的四分一.\n" +
              "Mr Chan: A full loop is " + m("2\\pi r") + ". You only drew " + m("90^\\circ") + ", that's a quarter of the loop.\n\n" +
              "**圓圓:** 這叫弧長. 弧長 " + m("=\\dfrac{\\theta}{360^\\circ}\\times 2\\pi r") + ".\n" +
              "Circle: That's called arc length. Arc " + m("=\\dfrac{\\theta}{360^\\circ}\\times 2\\pi r") + ".\n\n" +
              "**美心:** 圓規還張開 " + m("5\\text{ m}") + ", 所以這段弧是 " +
              m("\\dfrac{90}{360}\\times 2\\pi\\times 5=2.5\\pi\\text{ m}") + ".\n" +
              "Mei Sum: The compass is still open " + m("5\\text{ m}") + ", so this arc is " +
              m("2.5\\pi\\text{ m}") + ".",
          },
        ],
      },
      {
        id: "part2",
        title: "Areas & sectors",
        chapter: "Areas of circles and sectors",
        pages: [
          {
            id: "why-area",
            title: "The hole in the arch",
            image: img("05-circle-area.png"),
            text:
              "【畫面】終點拱門上有一個圓洞，要貼校徽。阿樂拿着圓貼紙比洞口。\n\n" +
              "**阿樂：** 貼紙邊緣跟洞口一圈對得上，是不是就夠了？\n" +
              "Ah Lok: If the sticker's edge matches the hole's edge, that's enough, right?\n\n" +
              "**美心：** 邊緣對得上，只代表周界一樣。要遮住裡面，看的是面積——中間那一整塊。\n" +
              "Mei Sum: Matching the edge only means the circumference matches. To cover the hole, we need the area — the whole inside.\n\n" +
              "**陳老師：** 周界是走一圈的路。面積是這一圈圍住的地面。圓面積：\n\n" +
              m("A=\\pi r^2") + "\n\n" +
              "**美心：** 校徽半徑 \\(5\\text{ cm}\\)，所以 " +
              m("A=\\pi\\times 5^2=25\\pi\\approx 78.5\\text{ cm}^2") + "。應該夠遮。\n" +
              "Mei Sum: Badge radius \\(5\\text{ cm}\\), so the area is about \\(78.5\\text{ cm}^2\\). It should cover the hole.",
          },
          {
            id: "ribbon-area",
            title: "Ribbon for a mini badge",
            image: img("05-circle-area.png"),
            text:
              "【畫面】阿樂拿着 \\(60\\text{ cm}\\) 彩帶，想再圍一個小校徽給頒獎桌。\n\n" +
              "**阿樂：** 這條彩帶六十厘米，圍成一圈當小校徽，中間能貼多大？\n" +
              "Ah Lok: This ribbon is sixty centimetres. If I loop it as a mini badge, how much space is inside?\n\n" +
              "**美心：** 先用剛才的周界。彩帶長就是 \\(C\\)，先求 \\(r\\)，再求面積——順序跟花環那一步一樣，只是多問「裡面」。\n" +
              "Mei Sum: Start with circumference again. The ribbon is \\(C\\). Find \\(r\\), then the area — same order as the wreath, but now we ask about the inside.\n\n" +
              m("r=\\dfrac{60}{2\\pi}\\approx 9.55\\text{ cm},\\quad A=\\pi r^2\\approx 287\\text{ cm}^2") + "\n\n" +
              "**美心：** 圍得成，裡面比你想的空。\n" +
              "Mei Sum: It'll loop. The space inside is bigger than you're picturing.",
            checks: [
              {
                id: "p2q1",
                prompt:
                  "A circle has radius " + m("7\\text{ cm}") +
                  ". Find its area (" + m("3") + " s.f.).",
                choices: [
                  m("154\\text{ cm}^2"),
                  m("44.0\\text{ cm}^2"),
                  m("49.0\\text{ cm}^2"),
                  m("22.0\\text{ cm}^2"),
                ],
                answer: 0,
                explain: m("A=\\pi r^2=\\pi\\times 49\\approx 154\\text{ cm}^2") + ".",
              },
            ],
          },
          {
            id: "semicircles",
            title: "Track bends on the arch",
            image: img("06-semicircles.png"),
            text:
              "【畫面】拱門頂上兩個半圓；入口有兩個半圓花槽模型。\n\n" +
              "**陳老師：** 拱門上面兩個半圓，看起來像不像跑道彎道對摺？\n" +
              "Mr Chan: Those two semicircles on the arch — don't they look like a track bend folded in half?\n\n" +
              "**阿樂：** 那油漆要按一個整圓來買？兩個半圓合起來……就是一個整圓？\n" +
              "Ah Lok: So we buy paint as one full circle? Two semicircles together… that's one whole circle?\n\n" +
              "**美心：** 對。面積用 \\(\\pi r^2\\) 一次就夠。下面長方形再另算。\n" +
              "Mei Sum: Yes. One \\(\\pi r^2\\) covers both semicircles. The rectangle underneath is separate.\n\n" +
              "**阿樂：** 入口花槽模型直徑 \\(8\\text{ cm}\\)，半徑 \\(4\\text{ cm}\\)，兩個半圓合起來也是 " +
              m("\\pi\\times 4^2=16\\pi") + "。\n" +
              "Ah Lok: The planter model is \\(8\\text{ cm}\\) across, so radius \\(4\\text{ cm}\\). Two semicircles again make \\(16\\pi\\).",
          },
          {
            id: "sector-ring",
            title: "Pizza and the scoring ring",
            image: img("07-sector-ring.png"),
            checks: [
              {
                id: "p2q2",
                prompt:
                  "A " + m("60^\\circ") + " sector has radius " + m("12\\text{ cm}") +
                  ". Find its area (leave " + m("\\pi") + " in the answer).",
                choices: [
                  m("24\\pi\\text{ cm}^2"),
                  m("144\\pi\\text{ cm}^2"),
                  m("72\\pi\\text{ cm}^2"),
                  m("12\\pi\\text{ cm}^2"),
                ],
                answer: 0,
                explain:
                  "Sector area " +
                  m("=(60/360)\\times\\pi r^2=\\tfrac{1}{6}\\times 144\\pi=24\\pi\\text{ cm}^2") +
                  ".",
              },
            ],
            text:
              "【畫面】選手餐有披薩；旁邊擲豆袋靶是同心圓。\n\n" +
              "**圓圓：** 我要那一角！像看台切下來的一塊——不是整個圓。\n" +
              "Circle: I'll take that slice! Like a piece of the grandstand — not the whole circle.\n\n" +
              "**美心：** 這角是 \\(90^\\circ\\)，剛好四分一個。整圓面積乘這個比例，就是這一角：\n\n" +
              m("A_{\\text{sector}}=\\dfrac{\\theta}{360^\\circ}\\times\\pi r^2=\\dfrac{90}{360}\\times\\pi\\times 10^2=25\\pi\\text{ cm}^2") + "\n\n" +
              "**陳老師：** 擲豆袋那個靶，中間空心的環才計分——不是整個大圓。\n" +
              "Mr Chan: On the bean-bag target, only the hollow ring scores — not the whole big circle.\n\n" +
              "**阿樂：** 大圓減小圓？\n" +
              "Ah Lok: Big circle minus small circle?\n\n" +
              "**美心：** 對。環的面積是 " + m("\\pi R^2-\\pi r^2=\\pi(R^2-r^2)") + "。\n" +
              "Mei Sum: Yes. The ring is \\(\\pi R^2-\\pi r^2=\\pi(R^2-r^2)\\).",
          },
        ],
      },
      {
        id: "part3",
        title: "Cylinders",
        chapter: "Volumes and total surface areas of circular cylinders",
        pages: [
          {
            id: "why-volume",
            title: "Water for the 800 m",
            image: img("08-cylinders.png"),
            text:
              "【畫面】補給站圓柱水桶。遠處八百米選手在熱身。\n\n" +
              "**美心：** 下一場是八百米。這些水夠不夠？不是問桶外面一圈有多長，是問裡面裝得下多少。\n" +
              "Mei Sum: Next is the 800 metres. Is there enough water? That's not 'how far around the barrel' — that's 'how much fits inside'.\n\n" +
              "**圓圓：** 這桶上下一樣圓，像把許多圓疊起來。每一層的面積是 \\(\\pi r^2\\)，疊多高就乘多高：\n\n" +
              m("V=\\pi r^2 h") + "\n\n" +
              "**阿樂：** 我量過，半徑 \\(3\\text{ cm}\\)、高 \\(9\\text{ cm}\\)，所以 " +
              m("V=\\pi\\times 3^2\\times 9=81\\pi\\text{ cm}^3") + " ……比我想像中多。\n" +
              "Ah Lok: I measured — radius \\(3\\text{ cm}\\), height \\(9\\text{ cm}\\), so \\(81\\pi\\text{ cm}^3\\)… more than I thought.",
            checks: [
              {
                id: "p3q1",
                prompt:
                  "A cylinder has base radius " + m("4\\text{ cm}") +
                  " and height " + m("10\\text{ cm}") +
                  ". Find its volume (leave " + m("\\pi") + " in the answer).",
                choices: [
                  m("160\\pi\\text{ cm}^3"),
                  m("40\\pi\\text{ cm}^3"),
                  m("80\\pi\\text{ cm}^3"),
                  m("16\\pi\\text{ cm}^3"),
                ],
                answer: 0,
                explain: m("V=\\pi r^2 h=\\pi\\times 16\\times 10=160\\pi\\text{ cm}^3") + ".",
              },
            ],
          },
          {
            id: "label",
            title: "Sticker on the side",
            image: img("08-cylinders.png"),
            text:
              "【畫面】阿樂拿着校名貼紙要包水桶；美心按住蓋子。\n\n" +
              "**阿樂：** 校名貼紙圍一圈就好了吧？連蓋一起包會不會比較好看？\n" +
              "Ah Lok: Just wrap the school name once around, right? Or should we cover the lid too — might look neater?\n\n" +
              "**陳老師：** 倒水要開蓋。貼紙只圍側面。把側面剪開攤平，是一張長方形：寬是周界 \\(2\\pi r\\)，高是桶高 \\(h\\)。\n" +
              "Mr Chan: We open the lid to pour. Wrap the side only. Cut the side and flatten it — a rectangle: width \\(2\\pi r\\), height \\(h\\).\n\n" +
              m("\\text{curved surface area}=2\\pi r h") + "\n\n" +
              "**美心：** 所以貼側面，用的是周界乘高，不是體積。\n" +
              "Mei Sum: So the side sticker uses circumference times height — not the volume.",
          },
          {
            id: "tsa",
            title: "If we wrapped the whole barrel",
            image: img("08-cylinders.png"),
            text:
              "【畫面】陳老師把紙桶展開：兩個圓 + 一張長方形。\n\n" +
              "**阿樂：** 那如果真的連蓋和底都包起來呢？\n" +
              "Ah Lok: What if we really wrapped the lid and the base as well?\n\n" +
              "**美心：** 側面那張長方形，再加上兩個圓：\n\n" +
              m("\\text{TSA}=2\\pi r h+2\\pi r^2") + "\n\n" +
              "**陳老師：** 陸運會我們只貼側面。但試卷問「總表面」，就要把兩個底加回去。不要把 \\(2\\pi r h\\) 當成全部。\n" +
              "Mr Chan: Today we only wrap the side. In a paper, 'total surface area' means add both bases. Don't treat \\(2\\pi r h\\) as the whole barrel.",
            checks: [
              {
                id: "p3q-tsa",
                prompt:
                  "A cylinder has radius " + m("5\\text{ cm}") +
                  " and height " + m("8\\text{ cm}") +
                  ". Find its total surface area (leave " + m("\\pi") + " in the answer).",
                choices: [
                  m("130\\pi\\text{ cm}^2"),
                  m("80\\pi\\text{ cm}^2"),
                  m("50\\pi\\text{ cm}^2"),
                  m("200\\pi\\text{ cm}^2"),
                ],
                answer: 0,
                explain:
                  m("\\text{TSA}=2\\pi r h+2\\pi r^2=80\\pi+50\\pi=130\\pi\\text{ cm}^2") + ".",
              },
            ],
          },
          {
            id: "rise",
            title: "The water jumped",
            image: img("09-water-finale.png"),
            checks: [
              {
                id: "p3q2",
                prompt:
                  "A stone of volume " + m("88\\text{ cm}^3") +
                  " is submerged in a cylindrical container of base radius " + m("4\\text{ cm}") +
                  " (no overflow). Find the rise in water level (" + m("3") + " s.f.).",
                choices: [
                  m("1.75\\text{ cm}"),
                  m("7.00\\text{ cm}"),
                  m("5.50\\text{ cm}"),
                  m("88.0\\text{ cm}"),
                ],
                answer: 0,
                explain:
                  "Volume of rise " + m("=88=\\pi r^2\\Delta h") +
                  ", so " + m("\\Delta h=88/(16\\pi)\\approx 1.75\\text{ cm}") + ".",
              },
            ],
            text:
              "【畫面】阿樂一不小心把小石頭掉進飲料桶，水位突然升；擲鴨攤兩隻鴨沉下去。\n\n" +
              "**阿樂：** 誰把石頭掉進飲料桶？水位突然升了！水又沒有多倒進去……\n" +
              "Ah Lok: Who dropped a stone in the drinks? The water jumped! We didn't pour any more in…\n\n" +
              "**陳老師：** 石頭佔了空間，水沒有別的路，只能往上。升起來那一截，體積等於石頭：\n\n" +
              m("\\pi r^2\\Delta h=V_{\\text{stone}}\\quad\\Rightarrow\\quad \\Delta h=\\dfrac{V_{\\text{stone}}}{\\pi r^2}") + "\n\n" +
              "**美心：** 擲鴨攤兩隻鴨也全沉了，水又升一截——一樣的道理。\n" +
              "Mei Sum: At the duck stall both ducks sank, and the water rose again — same idea.\n\n" +
              "**阿樂：** 八百米的人還在跑！我們先把桶抬回終點！\n" +
              "Ah Lok: The 800 is still going! Let's get these coolers to the finish!\n\n" +
              "**美心、阿樂：** 趕上了！\n" +
              "Mei Sum & Ah Lok: Just in time!",
          },
        ],
      },
    ],
  };

  function boot() {
    if (window.initJmComics) {
      window.initJmComics(DATA);
      return;
    }
    window.setTimeout(boot, 30);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
