//
// Exposition. Copyright (c) 2013 Aymeric Barthe.
// The Exposition code base is licensed under the GNU Affero General Public 
// License 3 (GNU AGPL 3) with the following additional terms. This copyright
// notice must be preserved in all source files, including files which are 
// minified or otherwise processed automatically.
// For further details, see http://exposition.barthe.ph/
//

/// <reference path="../lib/jquery.d.ts" />

/*jshint eqeqeq:true, browser:true, jquery:true, debug:true*/
/*global console:true, history:true*/

// Namespace declarations

module Exposition {

    // Debugging
    export var debug = false;

    /**
     * Assert that throws.
     *
     * @param cond boolean expression. Throws if false. Trigger debugger if Exposition.debug is true,
     * @message optional. A string, or exception object. Used for logging. Otherwise 'assertion failed'.
     *
     * Remark. There is a console.assert() but it does not throw, it just log errors.
     */
    export var assert = function(cond, message?: any) {
        if (! cond) {
            // Log error
            var str_msg = '';
            if (typeof message === 'string')
                str_msg = message;
            else if (message === undefined || typeof message !== 'object')
                str_msg = 'Assertion Failed';
            else /*typeof message === 'object' */
                str_msg = message.error || message; // default to toString()
            console.error(str_msg);

            // Trigger debugger
            if (debug)
                debugger;

            // Throw Error
            if (typeof message === 'object')
                throw message;
            else
                throw new Error(str_msg);
        }
    }

    /**
     * Load image asynchronously
     *
     * Creates an IMG element for the given URL and returns it (as a JQuery element).
     *
     * Error handling. The function may throw or return an empty jQuery object. However the
     * image loading callback does not throw, and call the on_fail handler instead. On success
     * the on_success handler is called. The jQuery element is also passed to both handlers.
     *
     * Design loosely inspired by (CSS backgrond not working for dynamic PHP pages)
     * - http://stackoverflow.com/questions/4285042/can-jquery-ajax-load-image
     * - http://stackoverflow.com/questions/5057990/how-can-i-check-if-a-background-image-is-loaded
     */
    export var loadImage = function(url, on_success, on_fail, alt_text, user_data?) : JQuery {
        // Precondition
        assert(url);
        assert(on_success);

        // Create img element
        var img = $('<img>');
        if (alt_text)
            img.attr('alt', alt_text);

        // Async load
        img.on('load', function() {
            var msg;
            if (!this.complete || !this.naturalWidth) {
                msg = 'Downloaded image is not valid: '+url;
                console.error(msg);
                if (on_fail)
                    on_fail(img, msg, user_data);
            } else {
                on_success(img, user_data);
            }
        });
        img.on('error', function(error) {
            // Apparently no way to get HTTP errors from IMG elements
            // http://stackoverflow.com/questions/8108636/how-to-get-http-status-code-of-img-tags
            // ### FIXME: As a workaround we could make an AJAX request on the URL and see what happens
            if (on_fail)
                on_fail(img, error, user_data);
        });
        img.attr('src', url);

        // Return jQuery IMG element
        return img;
    }

}

