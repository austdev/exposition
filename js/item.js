//
// Exposition. © 2013 Aymeric Barthe
//

/*jshint eqeqeq:true, browser:true, jquery:true*/

// Namespace declarations
var ph = ph || {};
ph.barthe = ph.barthe || {};

/**
 * Item class
 *
 * This is a frontend for the JSON Item format passed by the server. This class merely
 * provides validation of the JSON data, and read-only access. Each item can either be
 * an 'Album' with children (other Item objects) or a 'Photo'.
 *
 */

ph.barthe.Item = function(json) {
    
    // Redefinitions
    "use strict";
    var self = this;
    var assert = ph.barthe.assert;

    // Private members
    var m_children = [];

    // Public methods
    self.isPhoto = function() {
        return (json.type === 'photo');
    };
    self.isAlbum = function() {
        return (json.type === 'album');
    };
    self.title = function() {
        return json.title;
    };
    self.path = function() {
        return json.path;
    };
    self.children = function() {
        assert(self.isAlbum());
        return m_children;
    };
    self.getRandomPhotoPath = function() {
        assert(self.isAlbum());
        if (m_children.length === 0)
            return '';
        var photos = [];
        var albums = [];
        for (var i=0; i<m_children.length; ++i) {
            if (m_children[i].isPhoto())
                photos.push(m_children[i]);
            else
                albums.push(m_children[i]);
        }
        if (photos.length === 0) {
            // Continue until we find an album with a photo
            while (albums.length > 0) {
                var r1 = Math.floor(Math.random() * albums.length);
                var value = m_children[r1].getRandomPhotoPath();
                if (value)
                    return value;
                albums.splice(r1, 1);
            }
            return '';
        } else {
            var r2 = Math.floor(Math.random() * photos.length);
            return photos[r2].path();
        }
    };

    // Constructor: validate data
    (function() {
        var checkStringAttribute = function(name) {
            if (! json[name]) {
                throw { message: 'Missing '+name+' attribute in JSON.' };
            }
            if (typeof json[name] !== 'string') {
                 throw { message: 'Attribute '+name+' should be a String in JSON.' };
            }
        };
        checkStringAttribute('type');
        if (!self.isAlbum() && !self.isPhoto()) {
            throw { message: 'Invalid type attribute in JSON.' };
        }
        checkStringAttribute('title');
        checkStringAttribute('path');
        if (self.isAlbum()) {
            if (! json.children) {
                throw { message: 'Missing children attribute in JSON.' };
            }
            if( !ph.barthe.isArray(json.children) ) {
                throw { message: 'Attribute children should be an Array in JSON.' };
            }
            for (var i=0; i<json.children.length; ++i) {
                m_children.push(new ph.barthe.Item(json.children[i]));
            }
        }
    })();

};

/** 
 * Load a ph.barthe.Item item from a URL, or return cached version.
 *
 * Usage.
 * Call ph.barthe.Item.Load() with the following parameters.
 * @param url {string} URL where to load data from
 * @param path {string} Exposition path
 * @param on_success {function(ph.barthe.Item)} success callback, this CANNOT be immediate!
 * @param on_fail {function(jqXHR, textStatus, errorThrown)} error callback
 */
ph.barthe.Item.Load = (function() {
    var assert = ph.barthe.assert;  // Redifinitions
    var cache = {};                 // Cache to avoid re-loading. Map: path => ph.barthe.Item

    // Real body of function
    return function(url, path, on_success, on_fail) {

        // Check cache
        if (cache[path]) {
            setTimeout(function() { on_success(cache[path]); }, 0);
            return;
        }

        // Download item
        $.ajax(url+'?'+$.param({path: path}))
            .fail( on_fail )
            .done( function(data) {
                try {
                    var item = new ph.barthe.Item(data);
                    cache[path] = item;
                    on_success(item);
                } catch(e) {
                    on_fail(undefined, undefined, e);
                    if (ph.barthe.debug)
                        throw e;
                }
            });
    };
})();

