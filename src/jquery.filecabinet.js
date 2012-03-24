/*
 * jQuery Filecabinet UI Widget 
 * Copyright (c) 2012 Christian Pelczarski
 *
 * Depends:
 *   - jQuery 1.7
 *   - jQuery UI 1.8 
 *
 * Licensed under the MIT 
 *   http://www.opensource.org/licenses/mit-license.php
 *
*/
(function($, undefined){

  $.widget("min.filecabinet", {
      
      options: {
        addRowClassName: 'row',
        linkTitle: 'Add an attachment',
        linkClassName: 'filecabinet-link',
        linkContent: 'add attachment',
        numericNaming: true // if "false" then naming is array style e.g. <input ... name="file[]"; "true" is <input ... name="file1"; (or file2 .. 3)
      },

      _create: function(){
        var self = this,
             o   = self.options,
            el   = self.element;
        this.o = self.options;
        el.click($.proxy(this.add,this)); 
        this.container = $('<div class="filecabinet-container"></div>');
        el.after(this.container);
        this.addAnother();
      },
      
      add: function(event){
        this.nameSuffix = this._naming();
        var html = this.generateRow(this.options.addRowClassName,this.nameSuffix);
        this.addRow = $(html.join("\n"));
        input = this.addRow.find('input').first();
        chooseButton = this.addRow.find('button');
        chooseButton.button( { text: 'Choose file..' })
                                .click(function(){ return false; })
                                .find('.ui-button-text').css( { padding: '2px', fontSize: '12px' });
        // Need to do this after because we are modifying the .css of chooseButton
        // input and chooseButton must not be set to "this" vars because widget will not work correctly 
        // with multiple files attached
        chooseButton.bind('mousemove',{ input: input, choose: chooseButton }, this.moveUnder );
        // Add behavior to remove link
        // Done in a procedural fashion so it can
        // be used easily after initialization
        this.createRemoveButton(this.addRow);
        // After selecting a file this will strip out everything but the filename
        input.change(this._friendlyName);
        this.container.append(this.addRow);
        // See if the add another link needs to be added
        this.addAnother();
        this._trigger('added',event,this);
        return false;
      },

      generateRow: function(className,suffix){
        return [
                    '<div class="' + className + '">',
                    '<table><tr><td class="file-row">',
                    '<button class="choose-file">Choose file..</button>',
                    '<input type="file" class="upload-field" name="userfile' + suffix + '" />',
                    '</td><td class="file-display"> No file attached</td>',
                    '<td class="file-remove"><a href="#">remove</a></td>',
                    '</tr>',
                    '</table>',
                    '</div>'
                ];
      
      },

      addAnother: function(){
        if(!$('#add-another-row').size()){
          var o = this.options;
          var link = '<a href="#" title="' + o.linkTitle + '" class="' + o.linkClassName + '">' + o.linkContent + '</a>';
          var addAnotherRow = $('<div id="add-another-row"></div>').html(link);
          addAnotherRow.find('a').click($.proxy(this.add,this))
                        .button({ icons: { primary: 'ui-icon-circle-plus' } });
          this.container.after(addAnotherRow);
        }
      },

      moveUnder: function(event){
        // To debug this section it is best to make the opacity = 20 for file=input
        var e = event,
            choose = event.data.choose,
            input = event.data.input,
            fw  = choose.outerWidth(),
            fh  = choose.outerHeight(),
            o   = choose.offset(),
            x   = e.pageX - o.left,
            y   = e.pageY - o.top,
            X   =  x - (input.outerWidth() + 50),
            Y   =  y - (input.outerHeight() - 5),
            //Y   = y,
            rt  = o.left + fw,
            btm = o.top + fh;
        input.css( { 'top': Y + 'px', 'left': X + 'px' });
      },

      _naming: function(){
        var ret;
        if(this.options.numericNaming){
          var coll = [];
          $('.filecabinet-container input[type=file]').each(function(){
            var justNumeric = this.name.replace(/[^0-9]/g,'');
            coll.push(parseInt(justNumeric));
          });
          // Sort array : the last value will be the highest, take that value and add by 1
          if(coll.length){ 
            coll.sort(function(a,b){return a - b});
            ret = coll[coll.length - 1] + 1;
          }else{
            ret = 1;
          }
        }else{
          ret = '[]';
        }
        return ret;                         
      },

      _friendlyName: function(){
        var value = $(this).val().split(/\\/);
        $(this).closest('td').next().html(value[value.length-1]);
      },

      createRemoveButton: function(row){
        row.find('.file-remove a').bind('click',{ className: this.options.addRowClassName }, $.proxy(this.remove,this))
                                .button({ text: false, icons: { primary: 'ui-icon-close' } })
                                .css('width','1.1em')
                                .find('.ui-button-text').css( { padding: '0 2px', fontSize: '9px' });


      },

      remove: function(event){
        this._trigger('removed');
        $(event.target).closest('div.' + event.data.className).remove();
        return false;
      },

      removeAll: function(){
        this._trigger('removeAll');
        this.container.find('table').remove();
        return false;
      },

      _setOption: function(key, value) {
        var oldValue = this.options[key];
        // Call the base _setOption method
        $.Widget.prototype._setOption.apply(this, arguments);

        // The widget factory doesn't fire an callback for options changes by default
        // In order to allow the user to respond, fire our own callback
        this._trigger("setOption", {
            type: "setOption"
        },
        {
            option: key,
            original: oldValue,
            current: value
        });

      },

      destroy: function() {
        // Use the destroy method to reverse everything your plugin has applied
        // After you do that, you still need to invoke the "base" destroy method
        // Does nice things like unbind all namespaced events
        $.Widget.prototype.destroy.call(this);

        this.container.next().remove();
        this.container.remove();
      }
      
  });

})(jQuery);

