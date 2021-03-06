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
				.bind('keydown', function(e) { 
					self.keydown(e);
				})
				.bind("keydown keypress mousemove", function() {
				  options.caretPosition = $(this).caret();
				});

			var elSpan = el.parent().find('.form-control-calendar');

			elSpan
				.bind('click', function(e) {
						el.focus();
						self.toggle();
				});

			if(self.calendar.length) {
				self.calendar.hide();
			}

			$(document).bind('mouseup', function(e) {
				var target = e.target;
				var calendar = self.calendar;
				if(!el.is(target) && !elSpan.is(target) && !calendar.is(target) && calendar.has(target).length === 0 && calendar.is(':visible')) {
					self.hide();
					self.render();
				}
			});

			self.render();
		};

		datepicker.prototype =
		{
			keydown: function(e) {
				if (this.calendar.is(':visible')) {

					if (this.options.calendarType == 1) {
						switch (e.which){
						case 27: // escape
							this.toggle();
							break;
						case 37: // left
							this.moveSelectedDay(-1);
							break;
						case 39: // right
							this.moveSelectedDay(1);
							break;
						case 40: // down
							this.moveSelectedDay(7);
							break;
						case 13: // enter
							this.calendar.find('.selected').click();
							break;
						case 38: // up
							if (e.ctrlKey) {
								this.render(2);
							}
							else {
								this.moveSelectedDay(-7);
							}
							break;
						}
					}
					else if (this.options.calendarType == 2) {
						switch (e.which){
						case 27: // escape
							this.toggle();
							break;
						case 37: // left
							this.moveSelectedMonth(-1);
							break;
						case 39: // right
							this.moveSelectedMonth(1);
							break;
						case 38: // up
							if (e.ctrlKey) {
								this.render(3);
							}
							else {
								this.moveSelectedMonth(-3);
							}
							break;
						case 40: // down
							if (e.ctrlKey) {
								this.render();
							}
							else {
								this.moveSelectedMonth(3);
							}
							break;
						case 13: // enter
							this.calendar.find('.selected').click();
							break;
						}
					}
					else if (this.options.calendarType == 3) {
						switch (e.which){
						case 27: // escape
							this.toggle();
							break;
						case 37: // left
							this.moveSelectedYear(-1);
							break;
						case 39: // right
							this.moveSelectedYear(1);
							break;
						case 38: // up
							this.moveSelectedYear(-4);
							break;
						case 40: // down
							if (e.ctrlKey) {
								this.render(2);
							}
							else {
								this.moveSelectedYear(4);
							}
							break;
						case 13: // enter
							this.calendar.find('.selected').click();
							break;
						}
					}

					this.fillDate(this.options.selectedDate);
					e.preventDefault();
				};

				if (this.calendar.is(':hidden')) { 
					switch (e.which){
						case 38: // up
						case 40: // down
							var dir = e.which === 38 ? 1 : -1;

							var pos = this.options.caretPosition;
							var str = this.el.val();

				      var startSeparatorIndex = str.lastIndexOf(" ", pos);
				      var startWordIndex = (startSeparatorIndex !== -1) ? startSeparatorIndex + 1 : 0;

				      var endSeparatorIndex = str.indexOf(" ", pos);
				      var endWordIndex = (endSeparatorIndex !== -1) ? endSeparatorIndex : str.length

				      var word = str.substr(startWordIndex, endWordIndex-startWordIndex);

				      if (parseInt(word) > 0 && parseInt(word) < 32) {
				      	this.moveSelectedDay(dir);
				      }
				      else if(this.options.monthNames.indexOf(word) !== -1) {
				      	this.moveSelectedMonth(dir);
				      }
				      else if(parseInt(word) > 1000 && parseInt(word) < 3000) {
				      	this.moveSelectedYear(dir);
				      }

							e.preventDefault();
							this.fillDate(this.options.selectedDate);
				      this.el.caret(pos);
							break;
					}
					
				};
			},

			show: function() {
				$.each($('.datepicker').not(this.el), function(i, o) {
					if(o.length) { o.options.onHide(o.calendar) ; }
				});

				this.options.onShow(this.calendar);
			},

			hide: function() {
				this.options.onHide(this.calendar);
			},

			toggle: function() {
					if (this.calendar.is(':visible')) {
						this.hide(); 
						this.render();
					}
					else {
						this.show(); 
					}
			},

			fillDate: function(date) {

				var date = date.getFullYear()+' '+
									 this.options.monthNames[date.getMonth()]+' '+
									 date.getDate();
				this.options.onClick(this.el, $(this), date);
			},

			moveSelectedDay: function(days) {
				this.options.selectedDate._addDays(days);
				this.options.firstDate = this.options.selectedDate;
				this.render();
			},

			moveSelectedMonth: function(month) {
				this.options.selectedDate._addMonths(month);
				this.options.firstDate = this.options.selectedDate;
				this.render(2);
			},

			moveSelectedYear: function(year) {
				this.options.selectedDate._addYears(year);
				this.options.firstDate = this.options.selectedDate;
				this.render(3);
			},

			render: function(type) {
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
				options.monthNames = ['January', 'February', 'March', 
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
							width: '264px'
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

				startDate._addDays(startOffset);

				var showPrev = (prevFirstDate);
				var showNext = (nextFirstDate);

				var monyearClass = coreClass + 'header ';

				var prevCell = $('<div/>')
								.addClass(monyearClass)
								.css({
										'width': '36px',
										'height': '40px'
								})
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
								.css({
										height: '40px',
										width: '192px'
								})
								.click(function(e) {
										toggleMonthSelect(firstDateYear);
								});

				var nextCell = $('<div/>')
								.addClass(monyearClass)
								.css({
										width: '36px',
										height: '40px'
								})
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

				var cellsContainer = $('<div/>').addClass('cells-day-container').css('height', '190px');
				options.calendarType = 1;

				for(var row = 0, cellIndex = 0; row < maxRow + 1; row++) {
					for(var col = 0; col < maxCol; col++, cellIndex++) {
						var cellDate = new Date(startDate);
						var cellClass = '';
						var cell = $('<div/>')

						if(!row) {
							cell.html(dowNames[col]);

							cellClass = 'day-coll-'+col;
							cellDate = null;
						}
						else {
							cellDate._addDays(col + ((row - 1) * maxCol));

							var cellDateVal = cellDate._val();
							var cellDateTime = cellDateVal.time;

							cell.html(cellDateVal.date);

							cellClass = 'day day-coll-'+col+' day-row';

							if(firstDateMonth != cellDateVal.month) { cellClass += ' outday'; }
							if(options.selectedDate._time() == cellDateTime) { 
								cellClass = 'day day-coll-'+col+' day-row selected'; 
							}

							cell
								.mousedown(function() { return false; })
								.click(function(e) {
									var clickedData = $(this).data('data');

									options.selectedDate = options.firstDate = clickedData.date;

									self.render();
									self.hide();

									var date = clickedData.date.getFullYear()+' '+
														 options.monthNames[clickedData.date.getMonth()]+' '+
														 clickedData.date.getDate();
									options.onClick(el, $(this), date);
								});
							
						}

						cell
							.data('data', { date: cellDate})
							.addClass(coreClass + cellClass);

						cellsContainer.append(cell);
					}
				}

				calendar.append(cellsContainer);

				var todayButton = $('<button/>')
						.addClass('today-button')
						.html('Today')
						.click(function(e) {
							options.selectedDate = options.firstDate = new Date();

							var date = new Date().getFullYear()+' '+
												 options.monthNames[new Date().getMonth()]+' '+
												 new Date().getDate();

							options.onClick(el, $(this), date, 1);

							self.render();
							self.hide();

						});

				var headerContainer = $('<div/>').addClass('footer-container');
				headerContainer.append(todayButton);
				calendar.append(headerContainer);

				var toggleMonthSelect = function(year) {
					year = year || options.selectedDate.getFullYear();
					options.calendarType = 2;
					$(cellsContainer)
						.empty()
						.addClass('cells-month-container')
						.removeClass('cells-day-container cells-year-container');

					$.each(options.monthNames, function(i, v) {
						var o = $('<div/>')
								.html(v.substr(0,3))
								.addClass('core month month-coll-'+i%3)
								.click(function(e) {
									inputDate(year, i);
								});

						if(i == options.selectedDate.getMonth() && year == options.selectedDate.getFullYear()) { 
							o.addClass('selected').removeClass('month');
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
					year = year || options.selectedDate.getFullYear();
					options.calendarType = 3;
					$(cellsContainer)
						.empty()
						.addClass('cells-year-container')
						.removeClass('cells-month-container');

					var a = parseInt(year/16);
					var minYear = a*16;
					var maxYear = a*16+15;

					for(var i = minYear; i <= maxYear; i++)
					{
						var o = $('<div/>')
							.html(i)
							.addClass('core')
							.click(function(e) {
								toggleMonthSelect($(this).text());
							});
						if(i == options.selectedDate.getFullYear()) { 
							o.addClass('selected');
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


					$(titleCell).empty().html(minYear+' &mdash; '+maxYear);
					
				};

				var inputDate = function(year, month) {
					options.firstDate = new Date(year, month, 1);
					self.render();
				};

				var yearText = $('<span/>')
									.html(options.monthNames[firstDateMonth]+' '+firstDateYear);

				titleCell.append(yearText);

				if(type == 2) {
					toggleMonthSelect();
				}
				else if(type == 3) {
					toggleYearSelect();
				}

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

		Date.prototype._addDays = function(days) {
			this.setDate(this.getDate() + days);
		};

		Date.prototype._addMonths = function(months) {
			this.setMonth(this.getMonth() + months);
		};

		Date.prototype._addYears = function(years) {
			this.setFullYear(this.getFullYear() + years);
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