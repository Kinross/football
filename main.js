//globals: $, Math, Number, d3, document, navigator, window
/*jslint plusplus: true, regexp: true, white: true, nomen: true */
$(document).ready(function() {
	"use strict";

	function hasOntouchstart() {
		return window.hasOwnProperty('ontouchstart');
	}

	var isTouch = (hasOntouchstart() || (navigator.msMaxTouchPoints > 0)),
	    $hover = $("#hover"),
	    mousePadding = $hover.height() / 2,
	    defaultChordStarts = [[0, 0], [29, 3], [29, 12]],
	    jsonFeed,
	    navItems,
	    teamLookUp = [];

	teamLookUp.ARS = "Arsenal";
	teamLookUp.AST = "Aston Villa";
	teamLookUp.BAR = "Barnsley";
	teamLookUp.BIR = "Birmingham City";
	teamLookUp.BLB = "Blackburn Rovers";
	teamLookUp.BLP = "Blackpool";
	teamLookUp.BOL = "Bolton Wanderers";
	teamLookUp.BRA = "Bradford City";
	teamLookUp.BUR = "Burnley";
	teamLookUp.CAR = "Cardiff City";
	teamLookUp.CHA = "Charlton Athletic";
	teamLookUp.CHE = "Chelsea";
	teamLookUp.COV = "Coventry City";
	teamLookUp.CRY = "Crystal Palace";
	teamLookUp.DER = "Derby County";
	teamLookUp.EVE = "Everton";
	teamLookUp.FUL = "Fulham";
	teamLookUp.HUL = "Hull City";
	teamLookUp.IPS = "Ipswich Town";
	teamLookUp.LEE = "Leeds United";
	teamLookUp.LEI = "Leicester City";
	teamLookUp.LIV = "Liverpool";
	teamLookUp.LUT = "Luton Town";
	teamLookUp.MCI = "Manchester City";
	teamLookUp.MIL = "Millwall";
	teamLookUp.MUN = "Manchester United";
	teamLookUp.MID = "Middlesbrough";
	teamLookUp.NEW = "Newcastle United";
	teamLookUp.NOR = "Norwich City";
	teamLookUp.NOT = "Nottingham Forest";
	teamLookUp.NTC = "Notts County";
	teamLookUp.OLD = "Oldham Athletic";
	teamLookUp.OXF = "Oxford United";
	teamLookUp.POR = "Portsmouth";
	teamLookUp.QPR = "Queens Park Rangers";
	teamLookUp.REA = "Reading";
	teamLookUp.SHU = "Sheffield United";
	teamLookUp.SHW = "Sheffield Wednesday";
	teamLookUp.SOU = "Southampton";
	teamLookUp.STK = "Stoke City";
	teamLookUp.SUN = "Sunderland";
	teamLookUp.SWA = "Swansea City";
	teamLookUp.SWI = "Swindon Town";
	teamLookUp.TOT = "Tottenham Hotspur";
	teamLookUp.WAT = "Watford";
	teamLookUp.WBA = "West Bromwich Albion";
	teamLookUp.WHU = "West Ham United";
	teamLookUp.WIG = "Wigan Athletic";
	teamLookUp.WDN = "Wimbledon";
	teamLookUp.WOL = "Wolverhampton Wanderers";

	function setNav(id) {

		var $graphic = $(id),
		    seasonPoint = defaultChordStarts[id.replace("#g","")][0],
		    teamPoint = defaultChordStarts[id.replace("#g","")][1],
		    userTeamPoint = "badgeNotClicked",
		    i,
		    canvas,
		    d3LookUp = id.toString() + " div.d3",
		    $body = $('body'),
		    $window = $(window),
		    makeD3fit = function() {

			if ($window.height() > $window.width()) {
				// portrait
				$body.find(".graphic").removeClass("graphic-landscape");
				$body.find(".d3").css("height", Number($window.width()));

			} else {
				// landscape
				$body.find(".graphic").addClass("graphic-landscape");
				$body.find(".d3").css("height", Number($window.width() / 2));
			}
		};

		function drawChart() {

			var speed = 1200,
			    canvasSetting = {},
			    circle_radius = 0,
			    bezier_curves_radius,
			    circle_center_x_axis,
			    circle_center_y_axis,
			    angle_in_degrees = 0,
			    badgeInFocus,
			    badge_radius,
			    numberOfBadgesNeeded = jsonFeed.chord_graphs[seasonPoint].teams.length,
			    bezierCurves = [],
			    lineStartXY,
			    startAnchorXY,
			    finAnchorXY,
			    lineFinXY,
			    maxChordStrokeWidth,
			    svgBadgesTopButtons,
			    svgChords,
			    svgBadgesArtwork,
			    svgBadgesBottom,
			    w,
			    h,
			    badgesOnStage = [],
			    badgeAttr_1,
			    badgeAttr_2,
			    badge;

			$graphic.find('.face a').text(jsonFeed.chord_graphs[seasonPoint].season);
			canvas.selectAll('*').on('click', null);
			canvas.selectAll('*').on('mouseover', null);
			canvas.selectAll('*').on('mouseout', null);
			canvas.selectAll('*').on('mousemove', null);

			canvas.selectAll("*").remove();

			if (userTeamPoint !== "badgeNotClicked") {
				teamPoint = 0;
				for ( i = 0; i < jsonFeed.chord_graphs[seasonPoint].teams.length; i++) {
					if (jsonFeed.chord_graphs[seasonPoint].teams[i].team === userTeamPoint) {
						teamPoint = i;
						break;
					}
				}

				//teamPoint = userTeamPoint;
			}
			badgeInFocus = teamPoint;

			function calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees) {
				var x = circle_center_x_axis + (circle_radius * Math.cos((angle_in_degrees - 90) * (Math.PI / 180))),
				    y = circle_center_y_axis + (circle_radius * Math.sin((angle_in_degrees - 90) * (Math.PI / 180)));
				return ( {
					"cx" : x,
					"cy" : y
				});
			}

			function get_distance_between_2_points(p, q) {

				//horizontal difference
				var dx = p.cx - q.cx,

				//vertical difference
				    dy = p.cy - q.cy,

				//distance using Pythagoras theorem
				    dist = Math.sqrt(dx * dx + dy * dy);

				return dist;
			}

			w = 1;
			// $graphic.find(".d3").width();
			h = 1;
			// $graphic.find(".d3").height();

			canvasSetting.w = w;
			canvasSetting.h = h;

			circle_center_x_axis = w / 2;
			circle_center_y_axis = h / 2;

			if (w <= h) {
				circle_radius = w / 2;
			} else {
				circle_radius = h / 2;
			}

			// first time
			for ( i = 0; i < 2; i++) {

				bezier_curves_radius = circle_radius / 2.5;

				angle_in_degrees = 360 / numberOfBadgesNeeded;

				startAnchorXY = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

				angle_in_degrees = (360 / numberOfBadgesNeeded) * 2;

				finAnchorXY = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

				badge_radius = get_distance_between_2_points(startAnchorXY, finAnchorXY) / 2;

				// second time
				if (i === 0) {
					circle_radius -= badge_radius;
				}
			}

			maxChordStrokeWidth = badge_radius;

			svgChords = canvas.append('g').attr("class", "scale");

			function mouseHoverXY() {
				var left_;

				if (d3.event.pageX > ($body.width() / 2)) {
					left_ = (d3.event.pageX - $hover.width() - (mousePadding * 2.5)) + "px";
				} else {
					left_ = (d3.event.pageX + (mousePadding * 1.6)) + "px";
				}
				$hover.css({
					"top" : (d3.event.pageY - mousePadding) + "px",
					"left" : left_
				});
			}

			function scaleBadges(x, y, scale) {

				var newScale = 1 / 300 * (badge_radius * 1.3) * scale,
				    XY;

				//alert(badgesOnStage.length);
				for ( i = 0; i < badgesOnStage.length; i++) {

					angle_in_degrees = (360 / numberOfBadgesNeeded) * badgesOnStage[i].click;

					XY = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

					badgesOnStage[i].badge.transition().duration(1).attr("transform", "translate(" + (x + (XY.cx - (badge_radius * 0.65)) * scale) + "," + (y + (XY.cy - (badge_radius * 0.65)) * scale) + ")scale(" + newScale + ")");
					badgesOnStage[i].badge.transition().delay(speed).duration(1).attr("opacity", 1);

				}
			}

			function newSize(settings, canvas) {

				var new_width = $graphic.find(".d3").width(),
				    new_height = $graphic.find(".d3").height(),
				    width_height_ratio_benchmark = settings.w / settings.h,
				    width_height_ratio_current = new_width / new_height,
				    new_scale,
				    new_x = 0,
				    new_y = 0,
				    transitions = 0;
					
					$graphic.find(".d3").height(new_width);

				//if (width_height_ratio_current < width_height_ratio_benchmark) {
					new_scale = (1 / settings.w) * new_width;
					new_y = new_x;
					// new_height / 2 - (new_scale * settings.h / 2);
				//} else {
				//	new_scale = (1 / settings.h) * new_height;
				//	new_x = new_width / 2 - (new_scale * settings.w / 2);
				//}
				
				new_scale = new_scale * 0.99999999;

				canvas.selectAll("svg g.scale *").transition().duration(1).attr("transform", "translate(" + new_x + "," + new_y + ")scale(" + new_scale + ")").each("start", function() {
					transitions++;
				}).each("end", function() {
					if (--transitions === 0) {
						svgChords.attr("opacity", 1);
					}
				});
				scaleBadges(new_x, new_y, new_scale);

			}

			function darwChords() {

				svgChords.attr("opacity", 0);

				$graphic.find('h2').text(teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[badgeInFocus].team]);

				/*
				// For testing only, shows where the bezier curves anchor points are...
				var bezier_curves_points = [];
				for (i = 0; i < numberOfBadgesNeeded; i++) {
				angle_in_degrees = (360 / numberOfBadgesNeeded) * i;
				var point = canvas.append("circle").attr({
				"cx" : -100000,
				"cy" : -100000,
				"r" : 2,
				"fill" : "purple",
				"stroke" : "none"
				});
				bezier_curves_points.push(point);
				bezier_curves_points[i].attr(calculate_a_point_on_a_circles_circumference(bezier_curves_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees));
				}
				*/

				// A bezier curves in code : M0,100C0,0,100,0,100,100M0,100z
				// How the marked up works : M (line start x , y) C (start anchor x , y) , (fin anchor x , y) , (line fin x , y) M (line fin x , y) z

				// chords for Home and away matches
				bezierCurves = [];
				angle_in_degrees = (360 / numberOfBadgesNeeded) * badgeInFocus;

				lineStartXY = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

				startAnchorXY = calculate_a_point_on_a_circles_circumference(bezier_curves_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

				var vsPoint = 0,
				    location,
				    multiplierToDrawHomeAndAwayLines,
				    lineColour,
				    strokeWidth,
				    strokeWidthMultiplier,
				    j,
				    bezierCurve,
				    score;

				for ( i = 0; i < numberOfBadgesNeeded; i++) {

					if (i !== badgeInFocus) {

						//jsonFeed.chord_graphs[seasonPoint].teams.home[teamPoint].score

						//"chord_graphs":[{"season":"1992-93","teams":[{"team":"ARS","home"

						multiplierToDrawHomeAndAwayLines = 0.25;

						strokeWidthMultiplier = (maxChordStrokeWidth / 10);

						for ( j = 0; j < 2; j++) {

							score = [];

							if (j > 0) {
								if (jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].away[vsPoint].score === "-") {
									lineColour = "#fff";
									strokeWidth = 0;
								} else {

									score = (jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].away[vsPoint].score).split("-");

									if (score[0] === score[1]) {
										lineColour = "#a5a5a5";
										// gray
										strokeWidth = strokeWidthMultiplier;
									} else if (score[0] < score[1]) {
										lineColour = "#0769AD";
										// blue
										strokeWidth = (score[1] - score[0]) * strokeWidthMultiplier;
									} else {
										lineColour = "#CC181E";
										// red
										strokeWidth = (score[0] - score[1]) * strokeWidthMultiplier;
									}
								}
								location = "away";

							} else {
								if (jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].home[vsPoint].score === "-") {
									lineColour = "#fff";
									strokeWidth = 0;

								} else {

									score = (jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].home[vsPoint].score).split("-");

									if (score[0] === score[1]) {
										lineColour = "#a5a5a5";
										// gray
										strokeWidth = strokeWidthMultiplier;
									} else if (score[0] > score[1]) {
										lineColour = "#0769AD";
										// blue
										strokeWidth = (score[0] - score[1]) * strokeWidthMultiplier;
									} else {
										lineColour = "#CC181E";
										// red
										strokeWidth = (score[1] - score[0]) * strokeWidthMultiplier;
									}
								}
								location = "home";

							}

							angle_in_degrees = (360 / (numberOfBadgesNeeded * 2) ) * (i * 2) + (multiplierToDrawHomeAndAwayLines * (360 / numberOfBadgesNeeded ));

							lineFinXY = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

							finAnchorXY = calculate_a_point_on_a_circles_circumference(bezier_curves_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

							bezierCurve = svgChords.append("path").attr({
								"d" : "M" + lineStartXY.cx + "," + lineStartXY.cy + "C" + startAnchorXY.cx + "," + startAnchorXY.cy + "," + finAnchorXY.cx + "," + finAnchorXY.cy + "," + lineFinXY.cx + "," + lineFinXY.cy + "M100,100z",
								"fill" : "none",
								"stroke" : lineColour,
								"opacity" : 0.4,
								"stroke-width" : strokeWidth,
								"id" : vsPoint,
								"class" : location
							});

							bezierCurves.push(bezierCurve);
							multiplierToDrawHomeAndAwayLines = -0.25;

						}
						vsPoint++;
					}
				}

				// rollover
				svgChords.selectAll("path").on('mouseover', function() {
					var matchText = "";

					if ($(this).attr("class") === "home") {
						matchText += teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].team];
						matchText += " ";
						matchText += jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].home[$(this).attr("id")].score;
						matchText += " ";
						matchText += teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].home[$(this).attr("id")].vs];
					} else {
						matchText += teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].away[$(this).attr("id")].vs];
						matchText += " ";
						matchText += jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].away[$(this).attr("id")].score;
						matchText += " ";
						matchText += teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].team];
					}

					//alert(matchText);

					$hover.text(matchText);
					$(this).attr("opacity", 0.8);

					//alert($(this).attr("id") + " " + $(this).attr("class"));
				}).on('mouseout', function() {

					$hover.css({
						"top" : "-1000px",
						"left" : "-1000px"
					});
					$(this).attr("opacity", 0.4);

				}).on("mousemove", function() {
					mouseHoverXY();
				});
				newSize(canvasSetting, canvas);
			}

			darwChords();

			svgBadgesBottom = canvas.append('g').attr("class", "scale");
			svgBadgesArtwork = canvas.append('g');
			svgBadgesTopButtons = canvas.append('g').attr("class", "scale");
			for ( i = 0; i < numberOfBadgesNeeded; i++) {

				angle_in_degrees = (360 / numberOfBadgesNeeded) * i;

				badgeAttr_1 = {
					"cx" : -100000,
					"cy" : -100000,
					"r" : badge_radius,
					"fill" : "#fff",
					"stroke" : "#c5c5c5",
					"stroke-width" : "0.001"
				};

				badge = svgBadgesTopButtons.append("circle").attr(badgeAttr_1);

				badge.attr({
					"class" : "clicked click" + i,
					"opacity" : "0",
					"cursor" : "pointer"
				});

				badgeAttr_2 = calculate_a_point_on_a_circles_circumference(circle_radius, circle_center_x_axis, circle_center_y_axis, angle_in_degrees);

				badge.attr(badgeAttr_2);

				// need these to cover up bezier curve ends.
				badge = svgBadgesBottom.append("circle").attr(badgeAttr_1);
				badge.attr(badgeAttr_2);

			}

			svgBadgesTopButtons.selectAll("circle").on('mouseover', function() {

				if (!isTouch) {
					$(this).attr("opacity", 0.4);
				}

				var teamPoint_ = ($(this).attr("class").replace("clicked click", '')),
				    teamName_ = teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[teamPoint_].team];

				$hover.text(teamName_);

			}).on('mouseout', function() {

				$hover.css({
					"top" : "-1000px",
					"left" : "-1000px"
				});

				$(this).attr("opacity", 0);

			}).on("mousemove", function() {
				if (!isTouch) {
					mouseHoverXY();
				}
			});

			canvas.selectAll("circle.clicked").on('click', function() {
				badgeInFocus = Number((d3.select(this).attr("class")).replace(/[^0-9]/g, ''));
				teamPoint = badgeInFocus;
				userTeamPoint = jsonFeed.chord_graphs[seasonPoint].teams[teamPoint].team;
				svgChords.selectAll("path").remove();
				darwChords();

			});

			//$(window).off("resize", null);

			// set listener to trigger responsive code
			$window.on("resize", function() {
				newSize(canvasSetting, canvas);
			});

			function loaderSVG(feedURL, point) {

				// widths and heights will be gotten from adobe illustrator generated to scale svg to Canvas sizes!
				// load adobe illustrator generated svg
				$.get(feedURL, null, function(data) {

					var svgNode = $("svg", data),
					    _group = svgBadgesArtwork.append("g");

					// For testing...
					//_group.append("path").attr("d", "M0,0L0,300L300,300L300,0z").attr("fill", "black").attr("opacity", 0.3);

					svgNode.each(function() {

						$(this).find('*').each(function() {

							var source = $(this)[0],
							    _path = _group.append((source.nodeName)),
							    a;

							for ( i = 0; i < source.attributes.length; i++) {
								a = source.attributes[i];
								_path.attr(a.name, a.value);
							}
						});

					});

					badgesOnStage.push({
						"badge" : _group,
						"click" : point
					});

					badgesOnStage[badgesOnStage.length - 1].badge.attr("opacity", 0);

					newSize(canvasSetting, canvas);

				}, 'xml');

			}

			for ( i = 0; i < numberOfBadgesNeeded; i++) {

				//alert(teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[i].team]);

				loaderSVG("badges/" + ((teamLookUp[jsonFeed.chord_graphs[seasonPoint].teams[i].team]).replace(/ /g, '_')) + ".svg", i);

			}

		}

		function navShow() {
			var $div = $graphic.find('.nav');

			$graphic.find('.face a').addClass("nav-open");
			$div.find('ul li a').css("display", "block");
			$div.find('ul').css("display", "block");
		}

		function navHide() {
			var $div = $graphic.find('.nav');

			$graphic.find('.face a').removeClass("nav-open");
			$div.find('ul li a').css("display", "none");
			$div.find('ul').css("display", "none");
		}


		$graphic.find('.nav ul').empty();
		for ( i = 0; i < navItems.length; i++) {
			$graphic.find('.nav ul').append("<li><a class='" + i + "'>" + navItems[i] + "</a></li>");
		}

		navHide();

		$graphic.find('.face').on("click", function() {
			if ($graphic.find(".face a").hasClass("nav-open")) {
				navHide();
			} else {
				navShow();
			}
		});

		$graphic.find(".nav ul li a").on("click", function() {
			navHide();
			seasonPoint = $(this).attr('class');
			drawChart();
			//alert(seasonPoint);
		});

		$graphic.find('.d3').empty();

		canvas = d3.select(d3LookUp).append("svg");
		canvas.append("path").attr("id", "background").attr("d", "M-10000,-10000L-10000,10000L10000,10000L10000,-10000z").attr("fill", "yellow");

		canvas.attr({
			"width" : "100%",
			"height" : "100%"
		});

		$window.on("resize", null);
		$window.on("resize", makeD3fit);

		/*
		 function newSize() {
		 //canvas.attr("width", $body.find(".d3").width());
		 //canvas.attr("height", $body.find(".d3").height());
		 }
		 */

		drawChart();
		makeD3fit();

	}


	$.getJSON('football.json', function(data) {
		var i;
		jsonFeed = data;

		navItems = [];

		for ( i = 0; i < data.chord_graphs.length; i++) {
			navItems.push(data.chord_graphs[i].season);
		}
		//seasonPoint = jsonFeed.chord_graphs.length - 1;
		//startWebApp();

		$('.graphic').each(function() {
			setNav("#" + ($(this).attr("id")));
		});
		$("#loading").remove();
		$(".hide").removeClass("hide");
		$("#key").css('visibility','visible');
		$("#copyRight").css('visibility','visible');

	});

});
