(function($) {
	$.hasClass = function(obj, cls) {
		return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
	}

	$.addClass = function(obj, cls) {
		if(!$.hasClass(obj, cls)) obj.className += " " + cls;
	}

	$.removeClass = function(obj, cls) {
		if($.hasClass(obj, cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			obj.className = obj.className.replace(reg, ' ');
		}
	}

	$.DateUtil = {};
	$.DateUtil.addDate = function(date, inc) {
		var d = new Date(date);
		d.setTime(date.getTime() + inc * 24 * 3600 * 1000);
		return d;
	}
	$.DateUtil.getDateDiff = function(base, target) {
		return(target.getTime() - base.getTime()) / (24 * 3600 * 1000);
	}
	$.DateUtil.getToday = function() {
		var d = new Date();
		d.setHours(0, 0, 0, 0);
		return d;
	}

}(mui));

(function($) {
	var MonthView = (function($) {
		var MonthViewTemplate = '' +
			'<div class="mc-toolbar">' +
			'<button class="mui-btn" id="mc-btn-previous" type="button">前</button>' +
			'<button class="mui-btn" id="mc-btn-today" type="button">今</button>' +
			'<button class="mui-btn" id="mc-btn-next" type="button">后</button>' +
			'</div>' +
			'<div><table class="mc-table">' +
			'<tr class="mc-table-head mc-table-row">' +
			'<th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th>' +
			'</tr>' +
			'</table></div>' +
			'<div>' +
			'<table id = "mc-table-body" class="mc-table"></table>' +
			'</div>';

		var CellViewTemplate = '<td class="mc-table-cell"><a>1</a><a class="point"></a></td>';
		var cell_selected;
		var date_selected;
		var firstDateinMonthView;

		var renderSkelekon = function(container) {
			var  div  =  document.createElement("div");
			div.className = "mc-container"
			div.innerHTML  =  MonthViewTemplate;
			container.appendChild(div);

			var html = "";
			for(var i = 0; i < options.row_len; i++) {
				html += '<tr class="mc-table-row">';
				for(var j = 0; j < 7; j++) {
					html += CellViewTemplate;
				}
				html += '</tr>';
			}
			$("#mc-table-body")[0].innerHTML = html;

			var i = 0;

			$(".mc-table-cell").each(function() {
				this.setAttribute("mc-cell-index", i++);
			});
		};
		var changeMonth = function(date) {
			var firstDate = getFirstDateInMonth(date);
			firstDateinMonthView = firstDate;
			var i = 0;

			$(".mc-table-cell").each(function() {
				var d = $.DateUtil.addDate(firstDate, i++);
				this.firstChild.innerHTML = "" + d.getDate();
				var dm = d.getMonth() + 1;
				var dd = d.getDate();
				if(dm <= 9) {
					dm = "0" + dm;
				}
				if(dd <= 9) {
					dd = "0" + dd;
				}
				var cc = d.getFullYear() + "-" + dm + "-" + dd;
				$.removeClass(this, 'event_active');
				for(var c = 0; c < a.length; c++) {
					if(a[c] == cc) {
						$.addClass(this, 'event_active');
					}
				}

				if(d.getMonth() != date.getMonth()) {
					this.setAttribute("disabled", "disabled");
				} else {
					this.removeAttribute("disabled");
				}
				if(d.getTime() == date.getTime()) {
					$.addClass(this, "mc-cell-selected");
					cell_selected = this;
					date_selected = d;
				}

				if(d.getTime() == $.DateUtil.getToday().getTime()) {
					$.addClass(this, "mc-table-cell-today")
				} else {
					$.removeClass(this, "mc-table-cell-today")
				}
			});
		};
		var changeDate = function(date) {
			date && date.setHours(0, 0, 0, 0)
			if(cell_selected) {
				$.removeClass(cell_selected, "mc-cell-selected");
				if(date_selected.getFullYear() == date.getFullYear() &&
					date_selected.getMonth() == date.getMonth()) {
					var index = 1 * cell_selected.getAttribute("mc-cell-index") + $.DateUtil.getDateDiff(date_selected, date);
					cell_selected = $(".mc-table-cell")[index];
					$.addClass(cell_selected, "mc-cell-selected");
					date_selected = date;
				} else {
					changeMonth(date);
				}
			} else {
				changeMonth(date);
			}
			$("h1")[0].innerText = date_selected.getFullYear() + '.' + (date_selected.getMonth() + 1) + '.' + (date_selected.getDate());

			var sem = date_selected.getMonth() + 1;
			var sed = date_selected.getDate();
			if(sem <= 9) {
				sem = "0" + sem;
			}
			if(sed <= 9) {
				sed = "0" + sed;
			}
			mui.ajax('http://' + ip_address + 'process/listReqByDate', {
				data: {
					date: date_selected.getFullYear() + '-' + sem + '-' + sed
				},
				dataType: 'json',
				type: 'post',
				timeout: 0,
				success: function(r) {
					var table = mui('.mui-table-view')[0];
					table.innerHTML = '';
					var li = document.createElement('li');
					li.className = 'mui-table-view-cell mui-media';
					li.innerHTML = '<a href="javascript:;" class="title_1" style="padding-left: 20px !important">' +
						'<img class="mui-media-object mui-pull-left" src="../../img/information_approve@3x.png">' +
						'<div class="mui-media-body titlesp">' +
						'审批' +
						'</div>' +
						'<span class="first_page" id="pullrefresh_main.html">进入首页</span>' +
						'</a>';
					table.appendChild(li);
					if(r.value.length > 0) {
						for(var i = 0; i < r.value.length; i++) {
							var datadetail = JSON.parse(r.value[i].data);
							var typ = "";
							if(r.value[i].type == 1) {
								typ = "会议申请审批"
							} else if(r.value[i].type == 1) {
								typ = "会议报告审批"
							}
							var himg = "../../img/default_avatar@2x.png";
							var tim = datadetail.createDate.split(" ")[1];
							if(datadetail.createUserImage) {
								himg = "http://" + ip_address + "uploadFiles/headImage/" + datadetail.createUserImage
							}
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell mui-media';
							li.setAttribute("sp_id", r.value[i].systemno);
							li.innerHTML = '<a href="javascript:;">' +
								'<img class="mui-media-object mui-pull-left" src="' + himg + '">' +
								'<div class="mui-media-body user_ctn">' +
								datadetail.createUserName +
								'<p class="mui-ellipsis">' + tim + '</p>' +
								'</div>' +
								'<p class="user_ctn_list">' + typ + '</p>' +
								'</a>';
							table.appendChild(li);
						}
					}
				},
				error: function(xhr, type, errorThrown) {

				}
			});

			mui.ajax('http://' + ip_address + 'meeting/listMeetingByDate', {
				data: {
					date: date_selected.getFullYear() + '-' + sem + '-' + sed
				},
				dataType: 'json',
				type: 'post',
				timeout: 0,
				success: function(r) {
					var table = mui('.mui-table-view')[1];
					table.innerHTML = '';
					var li = document.createElement('li');
					li.className = 'mui-table-view-cell mui-media';
					li.innerHTML = '<a href="javascript:;" class="title_1" style="padding-left: 20px !important">' +
						'<img class="mui-media-object mui-pull-left" src="../../img/information_approve@3x.png">' +
						'<div class="mui-media-body titlesp">' +
						'会议' +
						'</div>' +
						'<span class="first_page" id="miss/report.html">进入首页</span>' +
						'</a>';
					table.appendChild(li);
					if(r.value.length > 0) {
						for(var i = 0; i < r.value.length; i++) {
							var datadetail = r.value[i];
							var typ = "";

							var himg = "../../img/default_avatar@2x.png";
							var tim = datadetail.time.split(" ")[1];
							if(datadetail.createUserImage) {
								himg = "http://" + ip_address + "uploadFiles/headImage/" + datadetail.createUserImage
							}
							var li = document.createElement('li');
							li.className = 'mui-table-view-cell mui-media';
							li.setAttribute("sp_id", r.value[i].systemno);
							li.innerHTML = '<a href="javascript:;">' +
								'<img class="mui-media-object mui-pull-left" src="' + himg + '">' +
								'<div class="mui-media-body user_ctn">' +
								datadetail.createUserName +
								'<p class="mui-ellipsis">' + tim + '</p>' +
								'</div>' +
								'<p class="user_ctn_list">参加会议</p>' +
								'</a>';
							table.appendChild(li);
						}
					}
				},
				error: function(xhr, type, errorThrown) {

				}
			});

		}

		function getFirstDateInMonth(date) {
			var d = new Date(date);
			d.setDate(1)
			var fd = $.DateUtil.addDate(d, (0 - d.getDay()));
			return fd;
		}

		return {
			date_selected: function() {
				return date_selected
			},
			init: function(o, c) {
				options = o
				renderSkelekon(o.container);

				this.changeDate(o.date || $.DateUtil.getToday());

				$("#mc-table-body").on('tap', '.mc-table-cell', function() {
					var idx = this.getAttribute("mc-cell-index");
					changeDate($.DateUtil.addDate(firstDateinMonthView, idx))

				});
				var swipeMonth = function(direction) {
					var d = new Date(date_selected);
					var m = d.getMonth() + direction;
					if(m == 12) {
						d.setMonth(0);
						d.setFullYear(d.getFullYear() + 1);
					} else if(m == -1) {
						d.setMonth(11);
						d.setFullYear(d.getFullYear() - 1);
					} else {
						d.setMonth(m);
					}
					changeDate(d);
				}
				o.container.addEventListener('swipeleft', function() {
					swipeMonth(1);
				})
				o.container.addEventListener('swiperight', function() {
					swipeMonth(-1);
				})
			},

			changeDate: changeDate,
		}
	}($));

	$.fn.MCalendar = function(option) {
		var options = {
			container: this[0],
			row_len: 6,
			date: undefined,
		}

		$.extend(options, option || {});
		options.date && options.date.setHours(0, 0, 0, 0);

		var mc = {
			options: {},
			getDate: function() {
				return MonthView.date_selected();
			},
			init: function() {
				var el;
				this.options = options;
				MonthView.init(options);

			},

			show: function() {
				options.container.style.display = "initial";

			},
			hide: function() {
				options.container.style.display = 'none';
			},

			changeDate: function(date) {
				MonthView.changeDate(date)
			},

		};

		mc.init();
		return mc;
	};

}(mui));