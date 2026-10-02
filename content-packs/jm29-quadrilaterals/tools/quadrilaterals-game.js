/* JM29 Game 1 — Identifying quadrilaterals.
 * Opening chapter + the six kingdoms of the parallelogram region.
 */
(function () {
  "use strict";

  var ART = "game/";
  var V = "?v=20260920-game4s";

  var TITLE = {
    eyebrow: "JM29 · Game 1",
    heading: "Identifying\nQuadrilaterals",
    sub: "Princesses are missing, impostors are everywhere, and kings are ready for war. Name the true princess in every kingdom.",
    bg: "op-01-title.png",
  };

  /* mode: "narration" = no speaker, "speech" = sage bubble, "scene" = corner prompt only. */
  var BEATS = [
    {
      bg: "op-02-missing.png",
      ken: "ken-a",
      mode: "narration",
      lines: ["One by one, the princesses of every kingdom have vanished."],
    },
    {
      bg: "op-03-distrust.png",
      ken: "ken-c",
      mode: "narration",
      lines: [
        "The kings blame one another.",
        "Armies are already gathering along every border.",
      ],
    },
    {
      bg: "op-04-impostors.png",
      ken: "ken-b",
      mode: "narration",
      lines: [
        "Meanwhile commoners hungry for palace riches step forward,",
        "each one claiming to be a missing princess.",
      ],
    },
    {
      bg: "op-05-relic.png",
      ken: "ken-d",
      mode: "narration",
      lines: [
        "You are a sage, and every court will let you examine its princess.",
        "Name the wrong one and the king will rage — and the war begins.",
      ],
    },
    {
      bg: "op-05-relic.png",
      mode: "speech",
      lines: [
        "This relic can rewind time three times.",
        "Choose wrongly, and it returns me to the moment before the choice.",
      ],
      fx: "relic",
    },
    {
      bg: "op-06-map.png",
      mode: "scene",
    },
    {
      bg: "op-06-map.png",
      mode: "speech",
      lines: [
        "This world has four major regions.",
        "Each region is home to several kingdoms.",
      ],
      fx: "map-zones",
    },
    {
      bg: "op-06-map.png",
      mode: "speech",
      lines: [
        "The parallelogram region is the largest of them all.",
        "Let us start there.",
      ],
      fx: "map-focus",
    },
  ];

  var REGION_OUTRO = [
    {
      bg: "op-07-parallelogram-farewell.png",
      ken: "ken-a",
      mode: "scene",
    },
    {
      bg: "op-06-map.png",
      ken: "ken-c",
      mode: "speech",
      lines: [
        "The Parallelogram Region is safe.",
        "Next stop: the Rhombus Zone.",
      ],
    },
  ];

  var ZONES = [
    { id: "para", tag: "Parallelogram", stroke: "#60a5fa", points: [[125, 360], [625, 360], [540, 680], [40, 680]], label: [332, 528] },
    { id: "rhombus", tag: "Rhombus", stroke: "#4ade80", points: [[855, 85], [1065, 255], [855, 425], [645, 255]], label: [855, 268] },
    { id: "rectangle", tag: "Rectangle", stroke: "#f87171", points: [[1160, 95], [1460, 95], [1460, 425], [1160, 425]], label: [1310, 272] },
    { id: "square", tag: "Square", stroke: "#c084fc", points: [[1020, 480], [1270, 480], [1270, 730], [1020, 730]], label: [1145, 617] },
  ];

  var ROUTE = "M55,820 C80,745 110,680 165,600";

  /* Every court offers the same five reasons; only the answer changes. */
  var REASONS = [
    "opp. sides equal",
    "opp. \u2220s equal",
    "diags. bisect each other",
    "2 sides equal and parallel",
    "opp. sides parallel",
  ];

  /* Figures live in a 0–120 × 0–100 box.
   * ticks / arrows are [sideIndex, count]; angles are [vertexIndex, count];
   * diagTicks are [vertexIndex, count] and mark the half-diagonal from that
   * vertex to where the two diagonals cross. */
  var SHAPE = {
    // True parallelograms. These are the ones that flatter the eye, so an
    // unmarked figure drawn on one of them is the most tempting wrong answer.
    a: [[18, 20], [98, 20], [86, 80], [6, 80]],
    b: [[12, 20], [92, 20], [104, 80], [24, 80]],
    c: [[34, 18], [104, 18], [78, 82], [8, 82]],
    d: [[22, 22], [102, 22], [92, 78], [12, 78]],
    e: [[8, 24], [88, 24], [100, 76], [20, 76]],
    f: [[28, 20], [108, 20], [88, 80], [8, 80]],

    // Off by a hair: reads as a parallelogram, but no pair is truly equal or
    // parallel, so only the marks decide.
    g: [[25, 16], [100, 24], [86, 83], [6, 72]],

    // Used once, in Kaldra. A figure is not drawn to scale: if a side carries
    // a parallel arrow it is parallel, however crooked the drawing looks.
    h: [[18, 18], [99, 24], [93, 80], [8, 75]],
  };

  var LEVELS = [
    {
      id: "para-01",
      chapter: "Parallelogram Region · Kingdom 1",
      name: "The Golden Court of Velora",
      bg: "kd-para-01.png",
      bgAngry: "kd-para-01-angry.png",
      bgPuzzled: "kd-para-01-puzzled.png",
      bgHappy: "kd-para-01-happy.png",
      king: "king-para-01.png",
      kingName: "King Velor",
      intro: [
        { who: "king", lines: ["Sage. Three women stand in my hall,", "and every one of them swears she is my daughter."] },
        { who: "king", lines: ["Only a true parallelogram carries my blood.", "Point to her — and do not make me angry."] },
        { who: "you", lines: ["Then let me read what each of them can prove,", "not what each of them looks like."] },
        { who: "you", lines: ["A figure is never drawn to scale.", "Only the marks on it can be trusted."] },
      ],
      cards: [
        {
          name: "Vela",
          poly: SHAPE.a,
          why: "Vela carries no marks at all — only a shape that looks right.\nLooking like a parallelogram is not evidence of being one.",
        },
        {
          name: "Corin",
          poly: SHAPE.d,
          ticks: [[0, 1], [2, 1]],
          diags: true,
          diagTicks: [[0, 2], [2, 2]],
          why: "Corin has one pair of equal sides and one bisected diagonal.\nNeither fact is enough, and together they still prove nothing.",
        },
        { name: "Mira", poly: SHAPE.g, ticks: [[0, 1], [2, 1], [1, 2], [3, 2]] },
      ],
      answer: 2,
      kingWrong: ["Wrong! You would hand my throne to a thief?", "Guards — take him!"],
      kingCorrect: ["Mira, then. Not the one I expected.", "Justify it, sage. Quote the reason."],
      reasonAnswer: 0,
      reasonWhy: [
        "",
        "Her equal marks are on the sides, not on the angles.",
        "No diagonals are drawn in her figure at all.",
        "Nothing here marks a side as parallel — only as equal.",
        "Parallel sides are what we must prove, not what we were given.",
      ],
      solve: [
        { who: "you", lines: ["Both pairs of opposite sides are marked equal,", "so the figure must be a parallelogram. (opp. sides equal)"] },
        { who: "king", lines: ["My daughter! Return to me!", "Velora owes you its peace, sage."] },
      ],
      outro: ["Velora lowers its banners of war.", "The road now climbs east, into the emerald hills of Sylvane."],
    },
    {
      id: "para-02",
      chapter: "Parallelogram Region · Kingdom 2",
      name: "The Emerald Court of Sylvane",
      bg: "kd-para-02.png",
      bgAngry: "kd-para-02-angry.png",
      bgPuzzled: "kd-para-02-puzzled.png",
      bgHappy: "kd-para-02-happy.png",
      king: "king-para-02.png",
      kingName: "King Sylvan",
      intro: [
        { who: "king", lines: ["Word of Velora reached me before you did.", "Three women wait. One daughter. Begin."] },
        { who: "you", lines: ["Then I shall weigh each claim on its own.", "A mark that proves nothing is worth nothing."] },
      ],
      cards: [
        {
          name: "Ysolde",
          poly: SHAPE.b,
          angles: [[0, 1], [2, 1]],
          why: "Ysolde shows only one pair of opposite angles equal.\nA kite does the same, so one pair is never enough.",
        },
        {
          name: "Brann",
          poly: SHAPE.e,
          ticks: [[0, 1], [1, 1], [2, 2], [3, 2]],
          why: "Brann's equal sides are adjacent, not opposite.\nThose marks describe a kite, which is no parallelogram.",
        },
        { name: "Talia", poly: SHAPE.f, angles: [[0, 1], [2, 1], [1, 2], [3, 2]] },
      ],
      answer: 2,
      kingWrong: ["You dare guess in my hall?", "My spears are already at the border, sage!"],
      kingCorrect: ["Talia, then. My court is listening.", "Name the reason, and name it exactly."],
      reasonAnswer: 1,
      reasonWhy: [
        "No side length is marked anywhere in her figure.",
        "",
        "No diagonals are drawn in her figure at all.",
        "Neither equal sides nor parallel sides are given here.",
        "Nothing in the figure marks a pair of sides as parallel.",
      ],
      solve: [
        { who: "you", lines: ["Both pairs of opposite angles are marked equal,", "so the figure must be a parallelogram. (opp. \u2220s equal)"] },
        { who: "king", lines: ["Talia. My own stubborn Talia.", "Sylvane stands down. Go on, sage."] },
      ],
      outro: ["Sylvane's spears go back into the racks.", "Beyond the hills the red towers of Ardenne are already waiting."],
    },
    {
      id: "para-03",
      chapter: "Parallelogram Region · Kingdom 3",
      name: "The Crimson Court of Ardenne",
      bg: "kd-para-03.png",
      bgAngry: "kd-para-03-angry.png",
      bgPuzzled: "kd-para-03-puzzled.png",
      bgHappy: "kd-para-03-happy.png",
      king: "king-para-03.png",
      kingName: "King Arden",
      intro: [
        { who: "king", lines: ["Two kings trusted you. I am not so easily charmed.", "In Ardenne a claim is weighed, not admired."] },
        { who: "you", lines: ["Then I shall not count the marks.", "I shall ask what each mark actually proves."] },
      ],
      cards: [
        {
          name: "Nerin",
          poly: SHAPE.a,
          diags: true,
          diagTicks: [[1, 1], [3, 1]],
          why: "Nerin proves only that one diagonal is cut in half.\nThe second diagonal is still completely unknown.",
        },
        {
          name: "Sable",
          poly: SHAPE.d,
          ticks: [[1, 1], [3, 1]],
          angles: [[0, 1], [2, 1]],
          why: "Sable has one pair of equal sides and one pair of equal angles.\nBoth are half-conditions, and two halves still prove nothing.",
        },
        { name: "Ilva", poly: SHAPE.e, diags: true, diagTicks: [[0, 1], [2, 1], [1, 2], [3, 2]] },
      ],
      answer: 2,
      kingWrong: ["A false daughter in the crimson seat!", "You have doomed us all, sage!"],
      kingCorrect: ["Ilva. Hm.", "Say why, and let the whole hall hear it."],
      reasonAnswer: 2,
      reasonWhy: [
        "The marks lie on the diagonals, not on the sides.",
        "The marks lie on the diagonals, not on the angles.",
        "",
        "No side is marked equal or parallel in her figure.",
        "Nothing in the figure marks a pair of sides as parallel.",
      ],
      solve: [
        { who: "you", lines: ["Each diagonal is cut into two equal halves by the other,", "so the figure must be a parallelogram. (diags. bisect each other)"] },
        { who: "king", lines: ["Then Ardenne was wrong to reach for its swords.", "Take my apology with you, sage."] },
      ],
      outro: ["Ardenne bolts its armoury shut.", "Ahead lie the violet spires of Amethys."],
    },
    {
      id: "para-04",
      chapter: "Parallelogram Region · Kingdom 4",
      name: "The Violet Court of Amethys",
      bg: "kd-para-04.png",
      bgAngry: "kd-para-04-angry.png",
      bgPuzzled: "kd-para-04-puzzled.png",
      bgHappy: "kd-para-04-happy.png",
      king: "king-para-04.png",
      kingName: "King Amethel",
      intro: [
        { who: "king", lines: ["My scribes let each claimant show what she pleased.", "Only one of them showed enough, sage."] },
        { who: "you", lines: ["Enough is a precise word in this court.", "I shall hold every claim to it."] },
      ],
      cards: [
        {
          name: "Perra",
          poly: SHAPE.f,
          ticks: [[0, 1], [2, 1]],
          arrows: [[1, 1], [3, 1]],
          why: "Perra's equal pair and parallel pair are different pairs.\nAn isosceles trapezium fits that description too.",
        },
        {
          name: "Wynne",
          poly: SHAPE.c,
          diags: true,
          diagTicks: [[0, 1], [2, 1]],
          angles: [[0, 1], [2, 1]],
          why: "Wynne has one diagonal bisected and one pair of equal angles.\nA kite carries both of those marks, so neither one is decisive.",
        },
        { name: "Odette", poly: SHAPE.b, ticks: [[0, 1], [2, 1]], arrows: [[0, 1], [2, 1]] },
      ],
      answer: 2,
      kingWrong: ["Half a proof is no proof!", "Amethys will answer this insult with steel!"],
      kingCorrect: ["Odette carries only one marked pair.", "Convince my court that one pair is enough."],
      reasonAnswer: 3,
      reasonWhy: [
        "Only one pair of sides is marked equal, not both pairs.",
        "No angle is marked in her figure.",
        "No diagonals are drawn in her figure at all.",
        "",
        "Only one pair is marked parallel, so the definition does not apply yet.",
      ],
      solve: [
        { who: "you", lines: ["One pair of opposite sides is both equal and parallel,", "so the figure must be a parallelogram. (2 sides equal and parallel)"] },
        { who: "king", lines: ["One pair. Both facts. I see it now.", "Amethys is yours to leave in peace."] },
      ],
      outro: ["Amethys puts out its war-fires.", "One kingdom remains: the iron-blue keep of Kaldra."],
    },
    {
      id: "para-05",
      chapter: "Parallelogram Region · Kingdom 5",
      name: "The Iron-Blue Court of Kaldra",
      bg: "kd-para-05.png",
      bgAngry: "kd-para-05-angry.png",
      bgPuzzled: "kd-para-05-puzzled.png",
      bgHappy: "kd-para-05-happy.png",
      king: "king-para-05.png",
      kingName: "King Kaldor",
      intro: [
        { who: "king", lines: ["Four kings have already bowed to you.", "My claimants brought marks enough to fill a ledger."] },
        { who: "you", lines: ["Then I shall count what the marks prove,", "not how many of them there are."] },
      ],
      cards: [
        {
          name: "Lira",
          poly: SHAPE.e,
          arrows: [[0, 1], [2, 1]],
          angles: [[0, 1], [1, 1]],
          why: "Lira has one pair of sides parallel and two touching angles equal.\nAn isosceles trapezium carries exactly those two marks.",
        },
        {
          name: "Fenna",
          poly: SHAPE.b,
          ticks: [[0, 1], [1, 1]],
          diags: true,
          diagTicks: [[0, 2], [2, 2]],
          why: "Fenna has two touching sides equal and one diagonal cut in half.\nA kite carries both of those, and a kite is no parallelogram.",
        },
        { name: "Sigrid", poly: SHAPE.h, arrows: [[0, 1], [2, 1], [1, 2], [3, 2]] },
      ],
      answer: 2,
      kingWrong: ["So the famous sage is a fraud after all!", "Kaldra marches at dawn!"],
      kingCorrect: ["Sigrid? Her figure is bent out of shape.", "The oldest reason, sage. Say it plainly."],
      reasonAnswer: 4,
      reasonWhy: [
        "No side is marked equal in her figure.",
        "No angle is marked in her figure.",
        "No diagonals are drawn in her figure at all.",
        "No side is marked equal, so this reason cannot be used.",
        "",
      ],
      solve: [
        { who: "you", lines: ["Both pairs of opposite sides are marked parallel,", "so the figure is a parallelogram by definition. (opp. sides parallel)"] },
        { who: "king", lines: ["Sigrid. My daughter.", "Kaldra is at peace. Ride on, sage."] },
      ],
      outro: ["Kaldra puts its spears back on the wall.", "One court still has not sent word: the shadowed keep of Vespera."],
    },
    {
      id: "para-06",
      chapter: "Parallelogram Region · Kingdom 6",
      name: "The Shadow Court of Vespera",
      bg: "kd-para-06.png",
      bgAngry: "kd-para-06-angry.png",
      bgPuzzled: "kd-para-06-puzzled.png",
      bgHappy: "kd-para-06-happy.png",
      king: "king-para-06.png",
      kingName: "King Vesper",
      intro: [
        { who: "king", lines: ["Five kings have already sent word ahead of you.", "None of them warned me you would take this long."] },
        { who: "king", lines: ["My scribes allowed each claimant two facts. No more.", "Two facts, sage. Find the pair that finishes the work."] },
        { who: "you", lines: ["Two facts can be two halves of one proof,", "or two pieces that never meet. Let me look."] },
      ],
      cards: [
        {
          name: "Maelis",
          poly: SHAPE.c,
          arrows: [[0, 1], [2, 1]],
          ticks: [[0, 1], [1, 1]],
          why: "Maelis has one pair parallel and two touching sides equal.\nA trapezium carries both of those marks at once.",
        },
        {
          name: "Orla",
          poly: SHAPE.a,
          ticks: [[0, 1], [1, 1]],
          diags: true,
          diagTicks: [[0, 2], [2, 2]],
          why: "Orla has one diagonal halved and two touching sides equal.\nThat describes a kite, and a kite is no parallelogram.",
        },
        {
          name: "Seren",
          poly: SHAPE.f,
          arrows: [[0, 1], [2, 1]],
          diags: true,
          diagTicks: [[0, 2], [2, 2]],
        },
      ],
      answer: 2,
      kingWrong: ["Two facts, and you still chose wrongly!", "Vespera has waited long enough — to arms!"],
      kingCorrect: ["Seren shows a parallel pair and half a diagonal.", "Explain how that can possibly be enough."],
      // The marks put two reasons one congruence apart, so both are accepted.
      reasonAnswer: [2, 3],
      reasonWhy: [
        "No side of her figure is marked equal to another.",
        "Not one angle is marked in her figure.",
        "",
        "",
        "Only one pair of her sides is marked parallel, not both.",
      ],
      solve: [
        { who: "you", lines: ["The parallel pair makes the alternate angles equal at that diagonal,", "and the diagonal is already cut in half."] },
        { who: "you", lines: ["So the two triangles are congruent. That halves the second diagonal", "and makes the parallel pair equal — either reason closes the proof."] },
        { who: "king", lines: ["Seren. All this time, in my own hall.", "Vespera withdraws. The region is whole again."] },
      ],
      outro: ["Six thrones, six daughters, and every proof answered.", "The parallelogram region lowers its banners at last."],
    },
  ];

  var SVG_NS = "http://www.w3.org/2000/svg";
  var MAX_REWIND = 3;

  var el = {};
  var index = -1;
  var typing = false;
  var typeTimer = null;
  var fullText = "";
  var stageReady = false;
  var mode = "intro"; // "intro" | "level" | "region-outro" | "card"
  var rewinds = MAX_REWIND;
  var levelNo = 0;
  var regionIndex = -1;
  // Shuffled once on load. The same seat order is used for every kingdom
  // and every replay until the page itself is reloaded.
  var reasonOrder = [];
  // A cross-fade owns the screen until the new beat is on it. Without this a
  // click landing mid-cut starts a second cut, and the first one still fires
  // its callbacks afterwards and repaints the beat we just left.
  var cutting = false;

  var lv = { data: null, phase: "", queue: [], chosen: -1, reasonMiss: 0, busy: false, picking: false };

  /* Scene cuts are timer-driven, so a jump (Skip intro, replay) must be able
   * to cancel every callback the previous scene still had in flight. */
  var timers = [];

  function later(fn, ms) {
    var id = setTimeout(function () {
      var k = timers.indexOf(id);
      if (k >= 0) timers.splice(k, 1);
      fn();
    }, ms);
    timers.push(id);
    return id;
  }

  function cancelLater() {
    timers.forEach(clearTimeout);
    timers = [];
    // Whoever cancels the queue is taking the screen, so no cut is pending.
    cutting = false;
  }

  function svg(name, attrs) {
    var node = document.createElementNS(SVG_NS, name);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    return node;
  }

  function perimeter(points) {
    var total = 0;
    for (var i = 0; i < points.length; i++) {
      var a = points[i];
      var b = points[(i + 1) % points.length];
      total += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return total;
  }

  function pointsAttr(points) {
    return points.map(function (p) { return p.join(","); }).join(" ");
  }

  function buildMapFx() {
    var fx = svg("svg", { class: "qg-mapfx", viewBox: "0 0 1600 900", preserveAspectRatio: "xMidYMid slice" });

    // Outer rect + parallelogram hole: evenodd keeps the focused region bright.
    var spot = svg("path", {
      class: "qg-spot",
      "fill-rule": "evenodd",
      d: "M0,0H1600V900H0Z M" + ZONES[0].points.map(function (p) { return p.join(","); }).join("L") + "Z",
    });
    fx.appendChild(spot);

    ZONES.forEach(function (zone, i) {
      var poly = svg("polygon", {
        class: "qg-zone" + (zone.id === "para" ? " hot" : ""),
        points: pointsAttr(zone.points),
        stroke: zone.stroke,
      });
      var len = Math.round(perimeter(zone.points));
      poly.style.setProperty("--len", len);
      poly.style.setProperty("--delay", (0.15 + i * 0.28) + "s");
      fx.appendChild(poly);
    });

    fx.appendChild(svg("path", { class: "qg-route", d: ROUTE }));

    ZONES.forEach(function (zone) {
      var tag = svg("text", { class: "qg-zone-tag", x: zone.label[0], y: zone.label[1] });
      tag.textContent = zone.tag;
      fx.appendChild(tag);
    });

    return fx;
  }

  /* ─── geometry figures for the claimant cards ──────────────────────── */

  function unit(from, to) {
    var dx = to[0] - from[0];
    var dy = to[1] - from[1];
    var len = Math.hypot(dx, dy) || 1;
    return [dx / len, dy / len];
  }

  function segMarks(a, b, count, kind, shift) {
    var d = unit(a, b);
    var n = [-d[1], d[0]];
    var mx = (a[0] + b[0]) / 2 + d[0] * (shift || 0);
    var my = (a[1] + b[1]) / 2 + d[1] * (shift || 0);
    var gap = kind === "arrow" ? 3.6 : 2.8;
    var out = [];

    for (var k = 0; k < count; k++) {
      var off = (k - (count - 1) / 2) * gap;
      var cx = mx + d[0] * off;
      var cy = my + d[1] * off;
      if (kind === "arrow") {
        var wing = 3.6;
        var nose = 2.1;
        out.push(svg("path", {
          class: "qg-mark",
          d: "M" + (cx - d[0] * nose + n[0] * wing) + "," + (cy - d[1] * nose + n[1] * wing) +
             "L" + (cx + d[0] * nose) + "," + (cy + d[1] * nose) +
             "L" + (cx - d[0] * nose - n[0] * wing) + "," + (cy - d[1] * nose - n[1] * wing),
        }));
      } else {
        var half = 3.6;
        out.push(svg("line", {
          class: "qg-mark",
          x1: cx - n[0] * half, y1: cy - n[1] * half,
          x2: cx + n[0] * half, y2: cy + n[1] * half,
        }));
      }
    }
    return out;
  }

  function angleMarks(P, v, count) {
    var cur = P[v];
    var u1 = unit(cur, P[(v + P.length - 1) % P.length]);
    var u2 = unit(cur, P[(v + 1) % P.length]);
    var sweep = (u1[0] * u2[1] - u1[1] * u2[0]) > 0 ? 1 : 0;
    var out = [];

    for (var k = 0; k < count; k++) {
      var r = 9 + k * 3.4;
      out.push(svg("path", {
        class: "qg-mark",
        d: "M" + (cur[0] + u1[0] * r) + "," + (cur[1] + u1[1] * r) +
           "A" + r + "," + r + " 0 0 " + sweep + " " + (cur[0] + u2[0] * r) + "," + (cur[1] + u2[1] * r),
      }));
    }
    return out;
  }

  function crossPoint(P) {
    var a = P[0], c = P[2], b = P[1], d = P[3];
    var d1x = c[0] - a[0], d1y = c[1] - a[1];
    var d2x = d[0] - b[0], d2y = d[1] - b[1];
    var den = d1x * d2y - d1y * d2x;
    if (!den) return [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
    var t = ((b[0] - a[0]) * d2y - (b[1] - a[1]) * d2x) / den;
    return [a[0] + d1x * t, a[1] + d1y * t];
  }

  function buildFigure(spec) {
    var fig = svg("svg", { class: "qg-fig", viewBox: "0 0 120 100", "aria-hidden": "true" });
    var P = spec.poly;

    if (spec.diags || spec.diagTicks) {
      fig.appendChild(svg("line", { class: "qg-diag", x1: P[0][0], y1: P[0][1], x2: P[2][0], y2: P[2][1] }));
      fig.appendChild(svg("line", { class: "qg-diag", x1: P[1][0], y1: P[1][1], x2: P[3][0], y2: P[3][1] }));
    }

    fig.appendChild(svg("polygon", { class: "qg-poly", points: pointsAttr(P) }));

    // A side carrying both an equal-length tick and a parallel arrow needs the
    // two marks pulled apart, or they stack on the same mid-point.
    var shared = {};
    (spec.ticks || []).forEach(function (t) { shared[t[0]] = (shared[t[0]] || 0) + 1; });
    (spec.arrows || []).forEach(function (t) { shared[t[0]] = (shared[t[0]] || 0) + 1; });

    (spec.ticks || []).forEach(function (t) {
      var shift = shared[t[0]] > 1 ? -8 : 0;
      segMarks(P[t[0]], P[(t[0] + 1) % P.length], t[1], "tick", shift).forEach(function (m) { fig.appendChild(m); });
    });
    (spec.arrows || []).forEach(function (t) {
      var shift = shared[t[0]] > 1 ? 8 : 0;
      var from = P[t[0]];
      var to = P[(t[0] + 1) % P.length];
      // Walking the outline reverses sides 2 and 3, so flip them back and the
      // arrowheads of a parallel pair point the same way.
      var arrow = t[0] >= 2 ? segMarks(to, from, t[1], "arrow", -shift) : segMarks(from, to, t[1], "arrow", shift);
      arrow.forEach(function (m) { fig.appendChild(m); });
    });
    (spec.angles || []).forEach(function (t) {
      angleMarks(P, t[0], t[1]).forEach(function (m) { fig.appendChild(m); });
    });
    if (spec.diagTicks) {
      var mid = crossPoint(P);
      spec.diagTicks.forEach(function (t) {
        segMarks(P[t[0]], mid, t[1], "tick").forEach(function (m) { fig.appendChild(m); });
      });
    }

    return fig;
  }

  /* ─── stage construction ───────────────────────────────────────────── */

  function build(stage) {
    stage.innerHTML = "";

    var bg = document.createElement("img");
    bg.className = "qg-bg";
    bg.alt = "";
    bg.src = ART + TITLE.bg + V;
    stage.appendChild(bg);

    var vignette = document.createElement("div");
    vignette.className = "qg-layer qg-vignette";
    stage.appendChild(vignette);

    var mapFx = buildMapFx();
    stage.appendChild(mapFx);

    var hud = document.createElement("div");
    hud.className = "qg-hud";
    hud.innerHTML =
      '<span class="qg-hud-label">Rewinds</span>' +
      '<span class="qg-gems"><i></i><i></i><i></i></span>';
    stage.appendChild(hud);

    var chapter = document.createElement("div");
    chapter.className = "qg-chapter-tag";
    chapter.innerHTML = '<span class="qg-chapter-zone"></span><span class="qg-chapter-name"></span>';
    stage.appendChild(chapter);

    var ask = document.createElement("p");
    ask.className = "qg-ask";
    stage.appendChild(ask);

    var choices = document.createElement("div");
    choices.className = "qg-choices";
    stage.appendChild(choices);

    var reasonWrap = document.createElement("div");
    reasonWrap.className = "qg-reasonwrap";
    reasonWrap.innerHTML =
      '<div class="qg-focus"><span class="qg-focus-name"></span></div>' +
      '<div class="qg-reasons"></div>';
    stage.appendChild(reasonWrap);

    var corner = document.createElement("p");
    corner.className = "qg-tap-corner";
    corner.textContent = "(tap to continue)";
    stage.appendChild(corner);

    var dialogue = document.createElement("div");
    dialogue.className = "qg-dialogue";
    dialogue.innerHTML =
      '<span class="qg-avatar" aria-hidden="true"></span>' +
      '<p class="qg-speaker">You</p>' +
      '<p class="qg-text"><span class="qg-body"></span><span class="qg-caret"></span></p>' +
      '<p class="qg-tap">(tap to continue)</p>';
    stage.appendChild(dialogue);

    var skip = document.createElement("button");
    skip.type = "button";
    skip.className = "qg-skip";
    skip.textContent = "Skip intro";
    stage.appendChild(skip);

    var flash = document.createElement("div");
    flash.className = "qg-layer qg-flash";
    stage.appendChild(flash);

    var fade = document.createElement("div");
    fade.className = "qg-layer qg-fade";
    stage.appendChild(fade);

    var title = document.createElement("div");
    title.className = "qg-title";
    title.innerHTML =
      '<p class="qg-eyebrow"></p>' +
      "<h3></h3>" +
      '<p class="qg-sub"></p>' +
      '<button type="button" class="qg-start">Start</button>' +
      '<button type="button" class="qg-start ghost qg-debug-open">Select level</button>' +
      '<div class="qg-debug" hidden></div>';
    stage.appendChild(title);
    title.querySelector(".qg-eyebrow").textContent = TITLE.eyebrow;
    title.querySelector("h3").textContent = TITLE.heading;
    title.querySelector(".qg-sub").textContent = TITLE.sub;

    var card = document.createElement("div");
    card.className = "qg-card";
    card.innerHTML =
      '<p class="qg-chapter"></p>' +
      "<h4></h4>" +
      '<p class="qg-card-text"></p>' +
      '<div class="qg-card-actions"></div>';
    stage.appendChild(card);

    el = {
      stage: stage,
      bg: bg,
      mapFx: mapFx,
      hud: hud,
      gems: [].slice.call(hud.querySelectorAll(".qg-gems i")),
      chapter: chapter,
      chapterZone: chapter.querySelector(".qg-chapter-zone"),
      chapterName: chapter.querySelector(".qg-chapter-name"),
      ask: ask,
      choices: choices,
      reasonWrap: reasonWrap,
      focus: reasonWrap.querySelector(".qg-focus"),
      focusName: reasonWrap.querySelector(".qg-focus-name"),
      reasons: reasonWrap.querySelector(".qg-reasons"),
      corner: corner,
      dialogue: dialogue,
      avatar: dialogue.querySelector(".qg-avatar"),
      speaker: dialogue.querySelector(".qg-speaker"),
      body: dialogue.querySelector(".qg-body"),
      tap: dialogue.querySelector(".qg-tap"),
      skip: skip,
      flash: flash,
      fade: fade,
      title: title,
      start: title.querySelector(".qg-start"),
      debugOpen: title.querySelector(".qg-debug-open"),
      debug: title.querySelector(".qg-debug"),
      card: card,
      cardChapter: card.querySelector(".qg-chapter"),
      cardHead: card.querySelector("h4"),
      cardText: card.querySelector(".qg-card-text"),
      cardActions: card.querySelector(".qg-card-actions"),
    };
  }

  function setBg(file, ken) {
    var next = ART + file + V;
    if (el.bg.getAttribute("src") !== next) el.bg.src = next;
    el.bg.className = "qg-bg";
    void el.bg.offsetWidth;
    if (ken) el.bg.classList.add(ken);
  }

  /* Swap the palace plate for the king's current temper. Kingdoms without a
   * plate for that mood simply stay on their calm one. */
  function setMood(mood) {
    var data = lv.data;
    if (!data || mode !== "level") return;
    var file =
      (mood === "angry" && data.bgAngry) ||
      (mood === "puzzled" && data.bgPuzzled) ||
      (mood === "happy" && data.bgHappy) ||
      data.bg;
    setBg(file);
  }

  /* ─── dialogue typing ──────────────────────────────────────────────── */

  function clearTyping() {
    if (typeTimer) { clearTimeout(typeTimer); typeTimer = null; }
    typing = false;
    el.dialogue.classList.remove("typing");
  }

  function unlockDialogueHeight() {
    el.dialogue.style.minHeight = "";
  }

  function lockDialogueHeight(text) {
    unlockDialogueHeight();
    el.body.textContent = text;
    var h = el.dialogue.offsetHeight;
    el.dialogue.style.minHeight = h + "px";
  }

  function finishTyping() {
    clearTyping();
    el.body.textContent = fullText;
    el.tap.classList.add("on");
  }

  function typeText(text) {
    fullText = text;
    el.tap.classList.remove("on");
    el.corner.classList.remove("on");
    lockDialogueHeight(text);
    el.body.textContent = "";
    typing = true;
    el.dialogue.classList.add("typing");

    var i = 0;
    function step() {
      if (i >= text.length) { finishTyping(); return; }
      var ch = text[i++];
      el.body.textContent += ch;
      var wait = 24;
      if (ch === "," || ch === ";" || ch === "—") wait = 150;
      else if (ch === "." || ch === "!" || ch === "?") wait = 260;
      else if (ch === "\n") wait = 180;
      typeTimer = setTimeout(step, wait);
    }
    step();
  }

  function hideDialogue() {
    clearTyping();
    unlockDialogueHeight();
    el.dialogue.classList.remove("on");
    el.tap.classList.remove("on");
    el.stage.classList.remove("talking");
  }

  /* ─── opening chapter ──────────────────────────────────────────────── */

  function renderGems() {
    el.gems.forEach(function (gem, i) { gem.classList.toggle("lit", i < rewinds); });
  }

  function applyFx(name) {
    var relic = name === "relic";
    var map = name === "map-zones" || name === "map-focus";

    el.hud.classList.toggle("on", relic || map);
    if (relic && !el.gems[0].classList.contains("lit")) {
      el.gems.forEach(function (gem, i) {
        later(function () { gem.classList.add("lit"); }, 260 + i * 280);
      });
      later(function () {
        el.flash.classList.remove("on");
        void el.flash.offsetWidth;
        el.flash.classList.add("on");
      }, 180);
    } else if (map) {
      el.gems.forEach(function (gem) { gem.classList.add("lit"); });
    } else if (!relic) {
      el.gems.forEach(function (gem) { gem.classList.remove("lit"); });
    }

    el.mapFx.classList.toggle("on", map);
    el.mapFx.classList.toggle("focus", name === "map-focus");
    el.mapFx.classList.toggle("labels", map);
  }

  function renderBeat(beat) {
    var speech = beat.mode === "speech";
    var narration = beat.mode === "narration";
    var scene = beat.mode === "scene";

    el.dialogue.classList.toggle("narration", narration);
    el.dialogue.classList.remove("king");
    el.avatar.style.backgroundImage = "";
    el.speaker.textContent = "You";

    el.stage.classList.toggle("talking", speech || narration);

    if (scene) {
      el.dialogue.classList.remove("on");
      el.tap.classList.remove("on");
      el.corner.classList.add("on");
      clearTyping();
      unlockDialogueHeight();
    } else {
      el.corner.classList.remove("on");
      el.dialogue.classList.add("on");
      typeText(beat.lines.join("\n"));
    }

    el.dialogue.setAttribute("aria-hidden", scene ? "true" : "false");
    if (speech || narration) el.dialogue.setAttribute("aria-live", "polite");
    applyFx(beat.fx);
  }

  function goTo(i, instant) {
    var beat = BEATS[i];
    var prev = BEATS[index];
    var sameShot = prev && prev.bg === beat.bg;
    index = i;

    el.skip.classList.toggle("on", i < BEATS.length - 1);

    if (sameShot || instant) {
      renderBeat(beat);
      return;
    }

    cutting = true;
    hideDialogue();
    el.corner.classList.remove("on");
    el.fade.classList.add("on");
    later(function () {
      setBg(beat.bg, beat.ken);
      el.fade.classList.remove("on");
      later(function () {
        cutting = false;
        renderBeat(beat);
      }, 220);
    }, 360);
  }

  function goRegionTo(i) {
    var beat = REGION_OUTRO[i];
    var prev = REGION_OUTRO[regionIndex];
    var sameShot = prev && prev.bg === beat.bg;
    regionIndex = i;

    if (sameShot) {
      renderBeat(beat);
      return;
    }

    cutting = true;
    hideDialogue();
    el.corner.classList.remove("on");
    el.fade.classList.add("on");
    later(function () {
      setBg(beat.bg, beat.ken);
      el.fade.classList.remove("on");
      later(function () {
        cutting = false;
        renderBeat(beat);
      }, 220);
    }, 360);
  }

  function startRegionOutro() {
    mode = "region-outro";
    cancelLater();
    clearScreen();
    el.card.classList.remove("on", "over");
    regionIndex = -1;
    goRegionTo(0);
  }

  function regionAdvance() {
    if (typing) { finishTyping(); return; }
    if (regionIndex >= REGION_OUTRO.length - 1) {
      showRegionCard();
      return;
    }
    goRegionTo(regionIndex + 1);
  }

  /* ─── kingdom runtime ──────────────────────────────────────────────── */

  function say(who, lines) {
    var narration = who === "narration";
    var king = who === "king";

    el.dialogue.classList.toggle("narration", narration);
    el.dialogue.classList.toggle("king", king);
    if (king && lv.data) {
      el.avatar.style.backgroundImage = 'url("' + ART + lv.data.king + V + '")';
      el.speaker.textContent = lv.data.kingName;
    } else {
      el.avatar.style.backgroundImage = "";
      el.speaker.textContent = "You";
    }
    el.stage.classList.add("talking");
    el.corner.classList.remove("on");
    el.dialogue.classList.add("on");
    el.dialogue.setAttribute("aria-hidden", "false");
    typeText(lines.join("\n"));
  }

  function queueSay(who, lines) {
    lv.queue.push({ who: who, lines: lines });
  }

  function lvAdvance() {
    if (lv.busy) return;
    if (typing) { finishTyping(); return; }
    if (lv.queue.length) {
      var beat = lv.queue.shift();
      say(beat.who, beat.lines);
      return;
    }
    lvPhaseEnd();
  }

  function shuffled(n) {
    var order = [];
    for (var i = 0; i < n; i++) order.push(i);
    for (var k = order.length - 1; k > 0; k--) {
      var j = Math.floor(Math.random() * (k + 1));
      var tmp = order[k]; order[k] = order[j]; order[j] = tmp;
    }
    return order;
  }

  function showChoices(data) {
    el.choices.innerHTML = "";
    el.choices.classList.remove("locked");
    // Reshuffle every time, so the true princess is never in a fixed seat.
    shuffled(data.cards.length).forEach(function (source, i) {
      var card = data.cards[source];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qg-choice";
      btn.style.setProperty("--i", i);
      btn.appendChild(buildFigure(card));
      var name = document.createElement("span");
      name.className = "qg-choice-name";
      name.textContent = card.name;
      btn.appendChild(name);
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        pickCard(source, btn);
      });
      el.choices.appendChild(btn);
    });
    el.ask.textContent = "Which claimant is a true parallelogram?";
    el.ask.classList.add("on");
    el.choices.classList.add("on");
    lv.picking = true;
  }

  function hideChoices() {
    lv.picking = false;
    el.ask.classList.remove("on");
    el.choices.classList.remove("on");
  }

  function rewind(after) {
    // The relic must still have a charge left; running dry ends the run.
    if (rewinds <= 0) { gameOver(); return; }
    lv.busy = true;
    rewinds -= 1;
    renderGems();
    el.hud.classList.add("spend");

    later(function () {
      el.flash.classList.remove("on", "bad");
      void el.flash.offsetWidth;
      el.flash.classList.add("on");
      el.stage.classList.add("rewinding");
    }, 220);

    later(function () {
      el.hud.classList.remove("spend");
      el.stage.classList.remove("rewinding");
      lv.busy = false;
      after();
    }, 1000);
  }

  function shakeAngry() {
    setMood("angry");
    el.stage.classList.remove("shake");
    void el.stage.offsetWidth;
    el.stage.classList.add("shake");
    el.flash.classList.remove("on", "bad");
    void el.flash.offsetWidth;
    el.flash.classList.add("on", "bad");
    later(function () { el.stage.classList.remove("shake"); }, 700);
  }

  function pickCard(i, btn) {
    if (!lv.picking || lv.busy) return;
    var data = lv.data;
    lv.picking = false;
    // The verdict animation owns the screen until the king answers.
    lv.busy = true;

    if (i === data.answer) {
      btn.classList.add("right");
      el.choices.classList.add("locked");
      lv.chosen = i;
      later(function () {
        hideChoices();
        lv.phase = "reason-intro";
        queueSay("king", data.kingCorrect);
        lv.busy = false;
        lvAdvance();
      }, 900);
      return;
    }

    btn.classList.add("wrong");
    shakeAngry();
    later(function () {
      hideChoices();
      lv.phase = "card-wrong";
      queueSay("king", data.kingWrong);
      queueSay("you", data.cards[i].why.split("\n"));
      lv.busy = false;
      lvAdvance();
    }, 760);
  }

  function showReasons(data) {
    [].forEach.call(el.focus.querySelectorAll(".qg-fig"), function (n) { n.remove(); });
    el.focus.insertBefore(buildFigure(data.cards[data.answer]), el.focusName);
    el.focusName.textContent = data.cards[data.answer].name;

    el.reasons.innerHTML = "";
    el.reasons.classList.remove("locked");
    var selected = [];
    var buttons = {};
    var submit = document.createElement("button");

    // Reason positions must not reveal the answer. Keep the source index on
    // each button so shuffling never changes which reason it represents.
    lv.reasonOrder.forEach(function (i, seat) {
      var text = REASONS[i];
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qg-reason";
      btn.style.setProperty("--i", seat);
      btn.textContent = text;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (!lv.picking || lv.busy) return;
        var at = selected.indexOf(i);
        if (at >= 0) selected.splice(at, 1);
        else selected.push(i);
        var on = selected.indexOf(i) >= 0;
        btn.classList.toggle("selected", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        submit.disabled = selected.length === 0;
      });
      buttons[i] = btn;
      el.reasons.appendChild(btn);
    });

    submit.type = "button";
    submit.className = "qg-reason qg-reason-submit";
    submit.style.setProperty("--i", REASONS.length);
    submit.textContent = "Submit";
    submit.disabled = true;
    submit.addEventListener("click", function (e) {
      e.stopPropagation();
      submitReasons(selected.slice(), buttons);
    });
    el.reasons.appendChild(submit);

    el.ask.textContent = "Select all valid reasons for " + data.cards[data.answer].name + ".";
    el.ask.classList.add("on");
    el.reasonWrap.classList.add("on");
    lv.picking = true;
  }

  function hideReasons() {
    lv.picking = false;
    el.ask.classList.remove("on");
    el.reasonWrap.classList.remove("on");
  }

  /* Most courts accept a single reason. Where the given marks put two reasons
   * exactly one step away, reasonAnswer lists every index that counts. */
  function reasonAccepted(data, i) {
    var ans = data.reasonAnswer;
    return ans instanceof Array ? ans.indexOf(i) >= 0 : i === ans;
  }

  function correctReasons(data) {
    return data.reasonAnswer instanceof Array ? data.reasonAnswer.slice() : [data.reasonAnswer];
  }

  function sameReasonSet(data, selected) {
    var correct = correctReasons(data);
    if (selected.length !== correct.length) return false;
    return correct.every(function (i) { return selected.indexOf(i) >= 0; });
  }

  function submitReasons(selected, buttons) {
    if (!lv.picking || lv.busy) return;
    var data = lv.data;
    lv.picking = false;
    // The verdict animation owns the screen until the king answers.
    lv.busy = true;

    if (sameReasonSet(data, selected)) {
      selected.forEach(function (i) { buttons[i].classList.add("right"); });
      el.reasons.classList.add("locked");
      later(function () {
        hideReasons();
        lv.phase = "solve";
        setMood("happy");
        data.solve.forEach(function (b) { queueSay(b.who, b.lines); });
        queueSay("narration", data.outro);
        lv.busy = false;
        lvAdvance();
      }, 900);
      return;
    }

    var wrong = selected.filter(function (i) { return !reasonAccepted(data, i); });
    wrong.forEach(function (i) { buttons[i].classList.add("wrong"); });
    var explanation = wrong.length
      ? data.reasonWhy[wrong[0]]
      : "That route works, but another marked route works too. Select every valid reason.";
    lv.reasonMiss += 1;

    if (lv.reasonMiss === 1) {
      // First slip is a warning: the king only frowns.
      setMood("puzzled");
      later(function () {
        hideReasons();
        lv.phase = "reason-warn";
        queueSay("king", ["Hmm. That is not what her marks say.", "I will allow you one more attempt."]);
        queueSay("you", [explanation, "Let me read her figure again."]);
        lv.busy = false;
        lvAdvance();
      }, 700);
      return;
    }

    shakeAngry();
    later(function () {
      hideReasons();
      lv.phase = "reason-rage";
      queueSay("king", ["Enough! You cannot even name your own reasoning!"]);
      queueSay("you", [explanation, "The relic turns the moment back."]);
      lv.busy = false;
      lvAdvance();
    }, 760);
  }

  function lvPhaseEnd() {
    var data = lv.data;
    switch (lv.phase) {
      case "intro":
        lv.phase = "cards";
        hideDialogue();
        showChoices(data);
        break;
      case "card-wrong":
        hideDialogue();
        rewind(function () {
          lv.phase = "cards";
          setMood("calm");
          showChoices(data);
        });
        break;
      case "reason-intro":
        lv.phase = "reason";
        hideDialogue();
        setMood("calm");
        showReasons(data);
        break;
      case "reason-warn":
        lv.phase = "reason";
        hideDialogue();
        // Keep the warning mood visible during the second attempt. The next
        // submission will move the king to happy or angry.
        showReasons(data);
        break;
      case "reason-rage":
        hideDialogue();
        // The rewind returns to the second attempt, so one more slip is fatal.
        lv.reasonMiss = 1;
        rewind(function () {
          lv.phase = "reason";
          setMood("calm");
          showReasons(data);
        });
        break;
      case "solve":
        lv.phase = "done";
        hideDialogue();
        if (levelNo + 1 < LEVELS.length) startLevel(levelNo + 1);
        else startRegionOutro();
        break;
      default:
        break;
    }
  }

  /* DEV ONLY: crude jump list. Region 1 = parallelogram, 2 = rhombus. */
  function jumpToLevel(n) {
    cancelLater();
    rewinds = MAX_REWIND;
    regionIndex = -1;
    el.title.classList.add("off");
    el.card.classList.remove("on", "over");
    el.debug.hidden = true;
    startLevel(n);
  }

  function paintDebugLevels() {
    el.debug.innerHTML = "";
    var regions = [
      { id: 1, label: "Para", count: LEVELS.length },
      { id: 2, label: "Rhombus", count: 0, planned: 4 },
    ];
    regions.forEach(function (region) {
      var row = document.createElement("div");
      row.className = "qg-debug-row";
      var tag = document.createElement("span");
      tag.textContent = region.id + " " + region.label;
      row.appendChild(tag);
      var shown = Math.max(region.count, region.planned || 0);
      for (var i = 0; i < shown; i++) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = region.id + "-" + (i + 1);
        if (region.id === 1 && i < LEVELS.length) {
          btn.addEventListener("click", (function (n) {
            return function (e) { e.stopPropagation(); jumpToLevel(n); };
          })(i));
        } else {
          btn.disabled = true;
        }
        row.appendChild(btn);
      }
      el.debug.appendChild(row);
    });
  }

  function startLevel(n) {
    var data = LEVELS[n];
    if (!data) { showRegionCard(); return; }

    mode = "level";
    cancelLater();
    levelNo = n;
    // busy until the palace has faded in — a click during the cut must not
    // run the (still empty) intro queue straight into the card phase.
    lv = {
      data: data,
      phase: "intro",
      queue: [],
      chosen: -1,
      reasonMiss: 0,
      reasonOrder: reasonOrder,
      busy: true,
      picking: false,
    };

    hideDialogue();
    hideChoices();
    hideReasons();
    el.corner.classList.remove("on");
    el.skip.classList.remove("on");
    el.card.classList.remove("on");
    el.mapFx.classList.remove("on", "focus", "labels");
    el.fade.classList.add("on");

    later(function () {
      setBg(data.bg);
      el.chapterZone.textContent = data.chapter;
      el.chapterName.textContent = data.name;
      el.chapter.classList.add("on");
      el.hud.classList.add("on");
      renderGems();
      el.fade.classList.remove("on");
      data.intro.forEach(function (b) { queueSay(b.who, b.lines); });
      later(function () {
        lv.busy = false;
        lvAdvance();
      }, 260);
    }, 520);
  }

  /* ─── full-screen cards ────────────────────────────────────────────── */

  function paintCard(chapter, head, text, actions) {
    el.cardChapter.textContent = chapter;
    el.cardHead.textContent = head;
    el.cardText.textContent = text;
    el.cardActions.innerHTML = "";
    actions.forEach(function (action) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "qg-start" + (action.ghost ? " ghost" : "");
      btn.textContent = action.label;
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        action.run();
      });
      el.cardActions.appendChild(btn);
    });
  }

  function clearScreen() {
    hideDialogue();
    hideChoices();
    hideReasons();
    el.corner.classList.remove("on");
    el.skip.classList.remove("on");
    el.hud.classList.remove("on");
    el.chapter.classList.remove("on");
    el.mapFx.classList.remove("on", "focus", "labels");
    el.choices.classList.remove("locked");
    el.reasons.classList.remove("locked");
  }

  function replayIntro() {
    resetToTitle();
    startStory();
  }

  /* The opening ends on this card so the jump into Kingdom 1 is a choice,
   * not a cut. */
  function showChapterCard() {
    mode = "card";
    cancelLater();
    clearScreen();
    el.card.classList.remove("over");
    paintCard(
      "Chapter 1",
      "The Parallelogram Region",
      "Six kingdoms, and every court wants a different proof. Read the marks on each claimant — " +
      "the relic rewinds time only three times.",
      [
        { label: "Start journey", run: function () { startLevel(0); } },
        { label: "Play again", ghost: true, run: replayIntro },
      ]
    );
    later(function () { el.card.classList.add("on"); }, 380);
  }

  function showRegionCard() {
    mode = "card";
    cancelLater();
    clearScreen();
    el.card.classList.remove("over");
    paintCard(
      "Region cleared",
      "The Parallelogram Region is safe",
      "All five reasons proved: opposite sides equal, opposite angles equal, diagonals bisecting, " +
      "one pair equal and parallel, and both pairs parallel — and in Vespera, two facts joined into one. " +
      "The rhombus region is still being built.",
      [
        { label: "Play again", run: replayIntro },
        { label: "Replay kingdoms", ghost: true, run: function () { rewinds = MAX_REWIND; startLevel(0); } },
      ]
    );
    later(function () { el.card.classList.add("on"); }, 380);
  }

  function gameOver() {
    mode = "card";
    cancelLater();
    clearScreen();
    el.card.classList.add("over");
    paintCard(
      "Game over",
      "The relic is spent",
      "Three rewinds are gone and the king's patience with them. The war begins — unless you take the journey again.",
      [
        { label: "Try again", run: replayIntro },
        { label: "Retry this kingdom", ghost: true, run: function () { rewinds = MAX_REWIND; startLevel(levelNo); } },
      ]
    );
    later(function () { el.card.classList.add("on"); }, 380);
  }

  /* ─── global flow ──────────────────────────────────────────────────── */

  function advance() {
    if (!stageReady) return;
    if (!el.title.classList.contains("off")) return;
    // An end card owns the screen from the moment it is requested, not from
    // the moment it finishes fading in.
    if (mode === "card" || el.card.classList.contains("on")) return;
    if (cutting) return;

    if (mode === "level") {
      if (lv.picking) return; // the answer buttons own the click
      lvAdvance();
      return;
    }

    if (mode === "region-outro") {
      regionAdvance();
      return;
    }

    if (typing) { finishTyping(); return; }
    if (index >= BEATS.length - 1) { showChapterCard(); return; }
    goTo(index + 1);
  }

  function startStory() {
    mode = "intro";
    cancelLater();
    rewinds = MAX_REWIND;
    levelNo = 0;
    regionIndex = -1;
    el.title.classList.add("off");
    el.card.classList.remove("on", "over");
    el.chapter.classList.remove("on");
    index = -1;
    cutting = true;
    el.fade.classList.add("on");
    later(function () {
      setBg(BEATS[0].bg, BEATS[0].ken);
      el.fade.classList.remove("on");
      index = 0;
      later(function () {
        cutting = false;
        renderBeat(BEATS[0]);
      }, 240);
      el.skip.classList.add("on");
    }, 360);
  }

  function resetToTitle() {
    mode = "intro";
    cancelLater();
    rewinds = MAX_REWIND;
    levelNo = 0;
    regionIndex = -1;
    index = -1;
    lv.data = null;
    clearScreen();
    el.card.classList.remove("on", "over");
    el.gems.forEach(function (gem) { gem.classList.remove("lit"); });
    setBg(TITLE.bg, "ken-c");
    el.title.classList.remove("off");
  }

  function gamesOpen() {
    var panel = document.getElementById("panel-games");
    return !!(panel && !panel.classList.contains("hidden"));
  }

  function init() {
    var stage = document.getElementById("qg-stage");
    if (!stage) return;
    build(stage);
    stageReady = true;
    reasonOrder = shuffled(REASONS.length);
    setBg(TITLE.bg, "ken-c");

    stage.addEventListener("click", function (e) {
      if (e.target.closest(".qg-start") || e.target.closest(".qg-skip") || e.target.closest(".qg-debug")) return;
      if (e.target.closest(".qg-choice") || e.target.closest(".qg-reason")) return;
      advance();
    });

    el.start.addEventListener("click", startStory);
    el.debugOpen.addEventListener("click", function (e) {
      e.stopPropagation();
      el.debug.hidden = !el.debug.hidden;
    });
    paintDebugLevels();
    el.skip.addEventListener("click", showChapterCard);

    document.addEventListener("keydown", function (e) {
      if (!gamesOpen()) return;
      if (e.target && e.target.closest && e.target.closest("input, textarea, select, button")) return;
      var next = e.code === "Space" || e.key === " " || e.key === "Enter" || e.key === "ArrowRight";
      if (!next) return;
      e.preventDefault();
      if (!el.title.classList.contains("off")) { startStory(); return; }
      advance();
    });

    // Leaving the tab must not leave a half-typed line behind.
    var panel = document.getElementById("panel-games");
    if (panel && window.MutationObserver) {
      new MutationObserver(function () {
        if (!gamesOpen() && typing) finishTyping();
      }).observe(panel, { attributes: true, attributeFilter: ["class"] });
    }

    // Pre-warm the art so black-screen cuts never stall.
    BEATS.forEach(function (beat) {
      var img = new Image();
      img.src = ART + beat.bg + V;
    });
    REGION_OUTRO.forEach(function (beat) {
      var img = new Image();
      img.src = ART + beat.bg + V;
    });
    LEVELS.forEach(function (data) {
      [data.bg, data.bgAngry, data.bgPuzzled, data.bgHappy, data.king].forEach(function (file) {
        if (!file) return;
        var img = new Image();
        img.src = ART + file + V;
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
