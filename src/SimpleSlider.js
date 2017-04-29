(function() {
    var SimpleSlider = function () {
        this.sliders = [];
        this.initQueue = [];
        this.initQueuePointer = 0;
        this.pageLoaded = false;

        if(document.readyState === "complete" || document.readyState === "loaded") {
            this.contentReady();
        } else {
            document.addEventListener("DOMContentLoaded", function() {
                this.contentReady();
            }.bind(this), false);
        }
    };

    SimpleSlider.prototype.init = function(data) {
        return new Promise(function(resolve, reject) {
            data.__readyCallback = function(slider) {
                resolve(slider);
            };

            if(this.pageLoaded) {
                this.initSlider(data);
            } else {
                this.initQueue.push(data);
            }
        }.bind(this));
    };

    SimpleSlider.prototype.contentReady = function() {
        this.initSliderFromQueue();
    };

    SimpleSlider.prototype.initSliderFromQueue = function() {
        if(this.initQueuePointer > this.initQueue.length - 1) {
            return;
        }

        var sliderData = this.initQueue[this.initQueuePointer];

        // Doing this instead of looking through the slider array directly
        // allows for one frame per slider.
        this.initSlider(sliderData).then(function() {
            this.initSliderFromQueue();
        }.bind(this), function() {
            console.warn("Error initializing " + sliderData.name + " slider.");
        });
    };

    SimpleSlider.prototype.initSlider = function(data) {
        return new Promise(function(resolve, reject) {
            requestAnimationFrame(function() {
                var _slider = new Slider(data);
                this.sliders.push(_slider);

                data.__readyCallback(_slider);
            }.bind(this));
        }.bind(this));
    };

    var Slider = function(data) {
        this.element = data.element || document.querySelector(data.selector);
        this.delay = data.delay || 5000;
        this.ready = false;
        this.counting = false;
        this.sliding = false;
        this.index = 0;

        this.setup();
    };

    Slider.prototype.setup = function() {
        var x, child, children = this.element.children;

        this.element.className += " _simple_slider";

        for(x = 0; x < children.length; x++) {
            child = children[x];

            if(x == 0) {
                child.className += " _slide _active";
            } else {
                child.className += " _slide";
            }

            child.addEventListener("transitionend", function(e) {
                this.childTransitionEnded(e);
            }.bind(this), false);

            child.addEventListener("touchstart", function(e) {
                this.touchStarted(e);
            }.bind(this), false);
        }

        this.ready = true;
        this.startCounting();
    };

    Slider.prototype.startCounting = function() {
        if(this.counting) {
            console.warn("Slider is already counting!");
            return;
        } else {
            this.counting = true;

            setInterval(function() {
                this.tick();
            }.bind(this), this.delay);
        }
    };

    Slider.prototype.tick = function() {
        this.next();
    };

    Slider.prototype.next = function() {
        if(this.sliding) {
            return;
        }

        const slidingClass = "_sliding";
        var children = this.element.children;

        requestAnimationFrame(function() {
            var nextIndex = this.index + 1 >= children.length ? 0 : this.index + 1;

            addClass(children[this.index], slidingClass);
            addClass(children[nextIndex], slidingClass);
        }.bind(this));

        this.sliding = true;
    };

    Slider.prototype.touchStarted = function(e) {
        console.log("touch started");
    };

    Slider.prototype.childTransitionEnded = function() {
        const slidingClass = "_sliding";

        if(this.sliding) {
            this.sliding = false;
            var children = this.element.children,
                nextIndex = this.index + 1 >= children.length ? 0 : this.index + 1;


            requestAnimationFrame(function() {
                removeClass(children[this.index], slidingClass);
                removeClass(children[nextIndex], slidingClass);

                removeClass(children[this.index], "_active");
                addClass(children[nextIndex], "_active");

                this.index = nextIndex;
            }.bind(this));
        }
    };

    function addClass(element, className) {
        if(!hasClass(element, className)) {
            element.className += " " + className;
        }
    };

    function removeClass(element, className) {
        const split = element.className.split(" ");
        var output = "", x, curr, found = false;

        for(x = 0; x < split.length; x++) {
            curr = split[x];

            if(curr !== className) {
                output += curr + " ";
            } else {
                found = true;
            }
        }

        if(found) {
            element.className = output;
        }
    };

    function hasClass(element, className) {
        const split = element.className.split(" ");
        var x, curr;

        for(x = 0; x < split.length; x++) {
            curr = split[x];

            if(curr === className) {
                return true;
            }
        }

        return false;
    };

    if(!window.SimpleSlider) {
        window.SimpleSlider = new SimpleSlider();
    } else {
        console.warn("SimpleSlider module conflicts with another object or module on this page.");
    }
})();
