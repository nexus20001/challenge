 ;(function() {
	$.fn.datepicker = function(options) {
		var pluginName = 'datepicker';

		var instance = this.data(pluginName);

		if(!instance) {
			return this.each(function() {
				return $(this).data(pluginName, new datepicker(this, options));
			});
		}

	};

	$.fn.datepicker.defaults =
	{
		onClick: (function(el, cell, date) {
			el.val(date);
		}),

		onShow: function(calendar) { calendar.show(); },

		onHide: function(calendar) { calendar.hide(); }
	};

	var datepicker = (function() {
		function datepicker(element) {
			var self = this;

			self.el = $(element);
			var el = self.el;

			self.options = $.fn.datepicker.defaults;
			var options = self.options;

			self.calendar = $($.find('.datepicker'));

			options.selectedDate = new Date();
			options.firstDate = (new Date(options.selectedDate))._first();

			el
				.bind('click', function(e) { self.show(e); })
				.bind('focus', function(e) { self.show(e); });

			if(self.calendar.length) {
				self.calendar.hide();
			}

			$(document).bind('mouseup', function(e) {
				var target = e.target;
				var calendar = self.calendar;

				if(!el.is(target) && !calendar.is(target) && calendar.has(target).length === 0 && calendar.is(':visible')) {
					self.hide();
					self.render();
				}
			});

			self.render();
		};

		datepicker.prototype =
		{
			show: function() {
				$.each($('.datepicker').not(this.el), function(i, o) {
					if(o.length) { o.options.onHide(o.calendar) ; }
				});

				this.options.onShow(this.calendar);
			},

			hide: function() {
				if(this.options) {
					this.options.onHide(this.calendar);
				}
			},

			render: function(renderCalback) {
				var self = this;
				var el = self.el;
				var options = self.options;
				var calendar = self.calendar;

				var coreClass = ' core ';

				var todayVal = new Date()._val();
				var todayTime = todayVal.time;

				var maxRow = 6;
				var maxCol = 7;

				var getSelectableList = function(min, max) {
					var resultList = [];
					for(var i = min; i <= max; i++) { resultList.push(i); }

					resultList.sort();

					return resultList;
				};

				var dowNames = [ 'SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA' ];
				var monthNames = ['January', 'February', 'March', 
													'April', 'May', 'June', 
													'July', 'August', 'September', 
													'October', 'November', 'December'];

				var containerWidth = el.outerWidth();
				var containerHeight = containerWidth;

				var getCellSize = function(_size, _count) {
					return (_size / _count);
				};

				var cellWidth = getCellSize(containerWidth, maxCol);
				var cellHeight = getCellSize(containerHeight, maxRow + 2);

				if(!calendar.length) {
					self.calendar = calendar = $('<div/>')
						.data('is', true)
						.css(
						{
							display: 'none',
							zIndex: 10,
							width: '220px'
						});

					$('body').append(calendar);
				}
				else {
					if(!eval(calendar.data('is'))) {
						containerWidth = calendar.outerWidth();
						containerHeight = calendar.outerHeight();

						cellWidth = getCellSize(containerWidth, maxCol);
						cellHeight = getCellSize(containerHeight, maxRow + 2);
					}
				}

				if(!el.is(':visible')) { calendar.hide(); }

				calendar
					.removeClass()
					.addClass('datepicker')
					.children().remove();

				var onResize = function() {
					var elPos = el.offset();
					calendar.css(
					{
						top: (elPos.top + el.outerHeight() + 4) + 'px',
						left: (elPos.left) + 'px'
					});
				};
				$(window).resize(onResize);
				onResize();

				var cellCSS =
				{
					width: '25px',
					height: '25px'
				};

				var setFirstDate = function(_date) {
					if(_date) {
						options.firstDate = _date;

						self.render();
					}
				};

				var getFirstDate = function(_offset) {
					var _date = new Date(options.firstDate);

					_offset = _offset || 0;

					_date.setMonth(_date.getMonth() + _offset);
					_date.setDate(Math.min(1, _date._max()));

					var dateVal = _date._val();

					var dateMonth = dateVal.month;
					var dateYear = dateVal.year;

					return _date;
				};

				var prevFirstDate = getFirstDate(-1);
				var nextFirstDate = getFirstDate(1);

				var firstDate = (options.firstDate = getFirstDate());
				var firstDateVal = firstDate._val();
				var firstDateMonth = firstDateVal.month;
				var firstDateYear = firstDateVal.year;

				var startDate = new Date(firstDate);

				var dowOffset = 0;

				var startOffset = startDate.getDay() - dowOffset;
				startOffset = startOffset < 1 ? -7 - startOffset : -startOffset;

				startDate._add(startOffset);

				var showPrev = (prevFirstDate);
				var showNext = (nextFirstDate);

				var monyearClass = coreClass + 'header ';

				var prevCell = $('<div/>')
								.addClass(monyearClass)
								.css(
									$.extend({}, cellCSS,
									{
										width: '30px',
										height: '34px'
									})
								)
								.append(
									$('<a/>')
										.addClass('prev-arrow' + (showPrev ? '' : '-off'))
										.html('<span class="left-arrow"></span>')
								)
								.mousedown(function() { return false; })
								.click(function(e) {
									if(showPrev) {
										setFirstDate(prevFirstDate);
									}
								});

				var titleCell = $('<div/>')
								.addClass(monyearClass + 'title')
								.css(
									$.extend({}, cellCSS,
									{
										height: '34px',
										width: '160px'
									})
								)
								.click(function(e) {
										toggleMonthSelect(firstDateYear);
								});

				var nextCell = $('<div/>')
								.addClass(monyearClass)
								.css(
									$.extend({}, cellCSS,
									{
										width: '30px',
										height: '34px'
									})
								)
								.append(
									$('<a/>')
										.addClass('next-arrow' + (showNext ? '' : '-off'))
										.html('<span class="right-arrow"></span>')
								)
								.mousedown(function() { return false; })
								.click(function(e) {
									if(showNext) {
										setFirstDate(nextFirstDate);
									}
								});

				var headerContainer = $('<div/>').addClass('header-container');
				headerContainer
					.append(prevCell)
					.append(titleCell)
					.append(nextCell);

				calendar.append(headerContainer);

				var cellsContainer = $('<div/>').addClass('cells-container').css('height', '176px');

				for(var row = 0, cellIndex = 0; row < maxRow + 1; row++) {
					for(var col = 0; col < maxCol; col++, cellIndex++) {
						var cellDate = new Date(startDate);
						var cellClass = '';
						var cell = $('<div/>')

						if(!row) {
							cell.html(dowNames[col]);
							cellDate = null;
						}
						else {
							cellDate._add(col + ((row - 1) * maxCol));

							var cellDateVal = cellDate._val();
							var cellDateTime = cellDateVal.time;

							cell.html(cellDateVal.date);

							cellClass = 'day';

							if(firstDateMonth != cellDateVal.month) { cellClass += ' outday'; }
							if(options.selectedDate._time() == cellDateTime) { cellClass = 'selected'; }

							cell
								.mousedown(function() { return false; })
								.click(function(e) {
									var clickedData = $(this).data('data');

									options.selectedDate = options.firstDate = clickedData.date;

									self.render(function() {
										self.hide();
									});

									var date = monthNames[clickedData.date.getMonth()]+' '+
									clickedData.date.getDate()+' '+clickedData.date.getFullYear();
									options.onClick(el, $(this), date);
								});
							
						}

						cell
							.data('data', { date: cellDate})
							.addClass(coreClass + cellClass)
							.css(cellCSS)
							.css(	
									$.extend({}, cellCSS,
									{
										height: '23px',
										width: '23px',
										lineHeight: '23px'
									})
									);

						cellsContainer.append(cell);
					}
				}

				calendar.append(cellsContainer);

				var todayButton = $('<button/>')
						.addClass('today-button')
						.html('Today')
						.click(function(e) {
							options.selectedDate = options.firstDate = new Date();

							var date = monthNames[new Date().getMonth()]+' '+
								new Date().getDate()+' '+new Date().getFullYear();

							options.onClick(el, $(this), date, 1);

							self.render(function() {
								self.hide();
							});

						});

				var headerContainer = $('<div/>').addClass('footer-container');
				headerContainer.append(todayButton);
				calendar.append(headerContainer);

				var toggleMonthSelect = function(year) {
					$(cellsContainer).empty();
					$.each(monthNames, function(i, v) {
						var o = $('<div/>')
								.html(v.substr(0,3))
								.addClass('core month')
								.css({
									'width': '32px', 
									'height': '22px', 
									'line-height': '20px',
									'margin': '9.125px 10.8px 9.125px 10.8px'})
								.click(function(e) {
									inputDate(year, i);
								});

						if(i == options.selectedDate.getMonth() && year == options.selectedDate.getFullYear()) { 
							o.addClass('selected-month').removeClass('month');
						}

						nextCell
							.off("click")
							.click(function(e) {
									toggleMonthSelect(parseInt(year)+1);
								});

						prevCell
							.off("click")
							.click(function(e) {
									toggleMonthSelect(parseInt(year)-1);
								});

						cellsContainer.append(o);
					});

					$(titleCell)
						.empty()
						.html(year)
						.off("click")
						.click(function(e) {
							toggleYearSelect(firstDateYear);
						});
				};

				var toggleYearSelect = function(year) {
					$(cellsContainer).empty();
					var minYear = year-8;
					var maxYear = year+7;

					for(var i=minYear; i<=maxYear; i++)
					{
						var o = $('<div/>')
							.html(i)
							.addClass('core year')
							.css({
								'width': '36px', 
								'height': '20px', 
								'line-height': '20px',
								'margin': '10.125px 2.125px 10.125px 2.125px'})
							.click(function(e) {
								toggleMonthSelect($(this).text());
							});
						if(i == options.selectedDate.getFullYear()) { 
							o.addClass('selected-year').removeClass('year');
						}
						cellsContainer.append(o);
					}

					nextCell
						.off("click")
						.click(function(e) {
								toggleYearSelect(parseInt(year)+8+8);
							});

					prevCell
						.off("click")
						.click(function(e) {
								toggleYearSelect(parseInt(year)-8-8);
							});

					var titleText = $('<span/>')
						.html(minYear+'-'+maxYear);

					$(titleCell).empty().html(minYear+'-'+maxYear);
					
				};

				var inputDate = function(year, month) {
					options.firstDate = new Date(year, month, 1);
					self.render();
				};

				var titleText = $('<span/>')
									.html(monthNames[firstDateMonth]+' '+firstDateYear)
									.mousedown(function() { return false; })
									.click(function(e) {
										toggleMonthSelect(firstDateYear);
									});

				var yearText = $('<span/>')
									.html(monthNames[firstDateMonth]+' '+firstDateYear);

				titleCell.append(yearText);

				renderCalback = renderCalback || (function() {});
				renderCalback();
			}
		};

		return datepicker;
	})();

	(function() {
		Date.prototype._clear = function() {
			this.setHours(0);
			this.setMinutes(0);
			this.setSeconds(0);
			this.setMilliseconds(0);

			return this;
		};

		Date.prototype._time = function() {
			return this._clear().getTime();
		};

		Date.prototype._max = function() {
			var isLeapYear = (new Date(this.getYear(), 1, 29).getMonth() == 1) ? 1 : 0;
			var days = [31, 28 + isLeapYear, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

			return days[this.getMonth()];
		};

		Date.prototype._add = function(days) {
			this.setDate(this.getDate() + days);
		};

		Date.prototype._first = function() {
			var date = new Date(this);
				date.setDate(1);

			return date;
		};

		Date.prototype._val = function() {
			this._clear();

			return {
				year: this.getFullYear(),
				month: this.getMonth(),
				date: this.getDate(),
				time: this.getTime(),
				day: this.getDay()
			};
		};
	})();
})();