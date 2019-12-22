var thumbnails = [];

var thumbnailWidth = 158;
var thumbnailHeight = 90;
var horizontalItemCount = 5;
var verticalItemCount = 5;

var init = function () {
    videojs('video').ready(function() {
        var that = this;

        var videoSource = this.player_.children_[0];

        var video = $(videoSource).clone().css('display', 'none').appendTo('body')[0];

        // videojs element
        var root = $(videoSource).closest('.video-js');

        // control bar element
        var controlBar = root.find('.vjs-control-bar');

        // thumbnail element
        controlBar.append('<div class="vjs-thumbnail"></div>');

        //
        controlBar.on('mousemove', '.vjs-progress-control', function() {
            // getting time 
            var time = $(this).find('.vjs-mouse-display .vjs-time-tooltip').text();

            // 
            var temp = null;

            // format: 09
            if (/^\d+$/.test(time)) {
                // re-format to: 0:0:09
                time = '0:0:' + time;
            } 
            // format: 1:09
            else if (/^\d+:\d+$/.test(time)) {
                // re-format to: 0:1:09
                time = '0:' + time;
            }

            //
            temp = time.split(':');

            // calculating to get seconds
            time = (+temp[0]) * 60 * 60 + (+temp[1]) * 60 + (+temp[2]);

            //
            for (var item of thumbnails) {
                //
                var data = item.sec.find(x => x.index === time);

                // thumbnail found
                if (data) {
                    // getting mouse position based on "vjs-mouse-display" element
                    var position = controlBar.find('.vjs-mouse-display').position();

                    // updating thumbnail css
                    controlBar.find('.vjs-thumbnail').css({
                        'background-image': 'url(' + item.data + ')',
                        'background-position-x': data.backgroundPositionX,
                        'background-position-y': data.backgroundPositionY,
                        'left': position.left + 10,
                        'display': 'block'
                    });

                    // exit
                    return;
                }
            }
        });

        // mouse leaving the control bar
        controlBar.on('mouseout', '.vjs-progress-control', function() {
            // hidding thumbnail
            controlBar.find('.vjs-thumbnail').css('display', 'none');
        });

        video.addEventListener('loadeddata', async function() {            
            //
            video.pause();

            //
            var count = 1;

            //
            var id = 1;

            //
            var x = 0, y = 0;

            //
            var array = [];

            //
            var duration = parseInt(that.duration());

            //
            for (var i = 1; i <= duration; i++) {
                array.push(i);
            }

            //
            var canvas;

            //
            var i, j;

            for (i = 0, j = array.length; i < j; i += horizontalItemCount) {
                //
                for (var startIndex of array.slice(i, i + horizontalItemCount)) {
                    //
                    var backgroundPositionX = x * thumbnailWidth;

                    //
                    var backgroundPositionY = y * thumbnailHeight;

                    //
                    var item = thumbnails.find(x => x.id === id);

                    if (!item) {
                        // 

                        //
                        canvas = document.createElement('canvas');

                        //
                        canvas.width = thumbnailWidth * horizontalItemCount;
                        canvas.height = thumbnailHeight * verticalItemCount;

                        //
                        thumbnails.push({
                            id: id,
                            canvas: canvas,
                            sec: [{
                                index: startIndex,
                                backgroundPositionX: -backgroundPositionX,
                                backgroundPositionY: -backgroundPositionY
                            }]
                        });
                    } else {
                        //

                        //
                        canvas = item.canvas;

                        //
                        item.sec.push({
                            index: startIndex,
                            backgroundPositionX: -backgroundPositionX,
                            backgroundPositionY: -backgroundPositionY
                        });
                    }

                    //
                    var context = canvas.getContext('2d');

                    //
                    video.currentTime = startIndex;

                    //
                    await new Promise(function(resolve) {
                        var event = function() {
                            //
                            context.drawImage(video, backgroundPositionX, backgroundPositionY, 
                                thumbnailWidth, thumbnailHeight);

                            //
                            x++;

                            // removing duplicate events
                            video.removeEventListener('canplay', event);

                            // 
                            resolve();
                        };

                        // 
                        video.addEventListener('canplay', event);
                    });


                    // 1 thumbnail is generated completely
                    count++;
                }

                // reset x coordinate
                x = 0;

                // increase y coordinate
                y++;

                // checking for overflow
                if (count > horizontalItemCount * verticalItemCount) {
                    //
                    count = 1;

                    //
                    x = 0;

                    //
                    y = 0;

                    //
                    id++;
                }

            }

            // looping through thumbnail list to update thumbnail
            thumbnails.forEach(function(item) {
                // converting canvas to blob to get short url
                item.canvas.toBlob(blob => item.data = URL.createObjectURL(blob), 'image/jpeg');

                // deleting unused property
                delete item.canvas;
            });

            
            
            console.log('done...');
        });

        // playing video to hit "loadeddata" event
        video.play();
    });
};

$('[type=file]').on('change', function() {
    var file = this.files[0];
    $('video source').prop('src', URL.createObjectURL(file));

    init();
});