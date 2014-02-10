require.config({
    paths: {
        "jquery": "vendor/jquery/jquery",
        "underscore": "vendor/underscore-amd/underscore",
        "backbone": "vendor/backbone-amd/backbone",
        "d3": "vendor/d3/d3",
        "content": "content",
        "topojson": "vendor/topojson/topojson",
        "slider": "vendor/jquery-simple-slider/js/simple-slider",
        "ui-slider": "vendor/jquery-ui/ui/jquery-ui",
        "queue": "vendor/queue-async/queue"
    },
    shim: {
        d3: { exports: 'd3' }
    }
});

requirejs(['jquery',
           'content',
           'd3',
           'backbone',
           'underscore'
          ],
          function($, content, d3, backbone, _) {
              var testd3 = d3;
              $(content.onReady());
          }
);
