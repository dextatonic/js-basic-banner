if (typeof hsr === 'undefined') {
	var hsr = {};
}

hsr.banner = {
	config: {
		debug: true,
		slide_source_path: '../assets', // please include source assets' path, relative to the HTML document, no trailing slash
		slide_source_images: [          // please include full filename but no path here
			'test_banner_1.gif',
			'test_banner_2.gif',
			'test_banner_3.gif',
			'test_banner_4.gif',
			'test_banner_5.gif'
		],
		slide_anim_duration: 500,       // ms
		slide_count: 5,                 // number of slides to display
		tick_duration: 33,              // 33 milliseconds ~= 30fps
		time_per_slide: 8               // seconds
	},
	controls: {
		begin: function() {
			// begins the banner slideshow from scratch
			hsr.banner.slides.reset();
			hsr.banner.state.running = true;
			hsr.banner.state.time_current_slide = 0;
			hsr.banner.slides.showCurrentSlide(1);
			hsr.banner.loop();
		},
		pause: function() {
			// pauses the slideshow on the current banner
			hsr.banner.state.paused = true;
		},
		selectSlide: function(slide) {
			// immediately slides to the selected banner
			hsr.banner.slides.jumpToSlide(slide);
		},
		unpause: function() {
			// unpauses the slideshow and continues from the current banner
			hsr.banner.state.paused = false;
		}
	},
	logMessage: function(message) {
		if (hsr.banner.config.debug) {
			console.log('[Tick: ' + hsr.banner.state.tick.count + ']' + message);
		}
	},
	loop: function() {
		if (hsr.banner.state.running) {
			hsr.banner.state.update();
			if (!(hsr.banner.state.paused)) {
				hsr.banner.slides.update();
			}
			setTimeout(function() { // recurse
                hsr.banner.loop();
            }, hsr.banner.config.tick_duration);
		}
	},
	slides: {
		animating: false,
		container: function() {
			return $('div#banner_slider');
		},
		frames: 1,
		jumpToSlide: function(slide) {
			hsr.banner.logMessage('Jumping to slide: ' + slide);
			var config = hsr.banner.config;

			if (!(this.animating)) {
				if (slide < 0 || slide > hsr.banner.config.slide_count) {
					return;
				}

				// reset the tick and update various states
				this.animating = true;
				this.frames = slide;
				hsr.banner.state.tick.resetTick();

				var current_position = ((hsr.banner.slides.frames - 1) * -750);
				var desired_position = ((slide - 1) * -750);

				this.container().animate({
					left: desired_position
				}, {
					duration: config.slide_anim_duration,
					easing: 'linear',
					complete: function() {
						hsr.banner.slides.animating = false;
						hsr.banner.slides.showCurrentSlide(slide);
					}
				});
			}
		},
		nextSlide: function() {
			var config = hsr.banner.config;

			if ((this.frames + 1) > config.slide_count) {
				this.frames = 1;
			}
			else {
				this.frames += 1;
			}

			this.jumpToSlide(this.frames);
		},
		reset: function() {
			// reset all slides and rebuild slideshow
			// this.container().empty();
			// TODO: Create X <div>s for containing individual slides: <div class="banner"></div>
			// TODO: Within each <div>, add the banner image: <img src="../assets/test_banner_1.gif">
			var config = hsr.banner.config;

			for (var i = 0; i < config.slide_count; i++) {
				var template = '<div class="banner"><img src="' + config.slide_source_path + config.slide_source_images[i] + '"></div>';
			}
		},
		showCurrentSlide: function(slide) {
			console.log('Currently showing slide: ' + slide);
			$('a.button_slide').removeClass('selected');
			$('a#button_slide_' + slide).addClass('selected');
		},
		update: function() {
			if (!(this.animating)) {
				if (hsr.banner.state.time_current_slide >= (hsr.banner.config.time_per_slide + (hsr.banner.config.slide_anim_duration / 1000))) {
					// time to show the next slide
					hsr.banner.state.tick.resetTick();
					this.nextSlide();
				}
			}
		}
	},
	state: {
		paused: false,
		running: false,
		tick: {
			advance: function() {
				this.count++;
				hsr.banner.state.time_current_slide = (this.count / hsr.banner.config.tick_duration);

				// ############################################################################################################################### DEBUG
				$('div#debug').html('<p>Tick: ' + this.count + '</p>' +
									'<p>Slides animating: ' + hsr.banner.slides.animating + '</p>' + 
									'<p>Time on slide: ' + hsr.banner.state.time_current_slide.toFixed() + '</p>' + 
									'<p>Current frame: ' + hsr.banner.slides.frames + '</p>' +
									'<p>Pause status: ' + (hsr.banner.state.paused ? 'PAUSED' : 'Running') + '</p>');
			},
			count: 0,
			resetTick: function() {
				this.count = 0;
			}
		},
		time_current_slide: 0,
		update: function() {
			this.tick.advance();
		}
	}
};

