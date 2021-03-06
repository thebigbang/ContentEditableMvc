﻿$(function () {

    var currentEditingWrapper;
    var dropdownFocussed;
    var timeout;
    $('.cem-content').focus(function () {
        var cemWrapper = $(this).parent();
        if (currentEditingWrapper != cemWrapper)
            startEditing(cemWrapper);
    });
    function blurTimeout(cemContent) {
        var cemWrapper = cemContent.parent();
        stopEditing(cemWrapper);
    }
    $('.cem-content').blur(function () {
        var isDropDown = $(this).attr('data-dropdown');
        if (isDropDown=="true") return;
        var cemContent = $(this);
        window.setTimeout(function () {
            blurTimeout(cemContent);
        }, timeout);
    });

    $('.cem-savechanges').click(function () {
        var cemWrapper = $(this).closest('.cem-wrapper');
        saveChanges(cemWrapper);
    });

    //  No need for .cem-discardchanges - clicking it blurs the input, so it discards the changes anyway.
    $('.cem-discardchanges').click(function () {
        var cemWrapper = $(this).closest('.cem-wrapper');
        stopEditing(cemWrapper);
    });
    $('.cem-content').keypress(function (event) {
        if (event.keyCode == 10 || event.keyCode == 13) {
            var allowMultiline = $(this).attr('data-multiline');
            var isDropDown = $(this).attr('data-dropdown');

            //  If we're not allowing multiline or dropdown mode, save changes instead.
            if (allowMultiline != "true" && isDropDown != "true") {
                event.preventDefault();
                saveChanges($(this));
                $(this).blur();
                return false;
            }
        }
        return true;
    });
    $('.cem-dropdownbox').on("change",function (event) {
        //find closest, change text value.
        $(this).closest('.cem-wrapper').find('.cem-content').html($(this).val());
    });
    function saveChanges(cemWrapper) {

        //  Clear the original value, so we don't reset it.
        var cemContent = cemWrapper.find('.cem-content');
        cemWrapper.data('original', null);

        var data = {
            PropertyName: cemContent.attr('data-property-name'),
            NewValue: cemContent.html(),
            RawModelData: cemContent.attr('data-model-data')
        };

        $.ajax({
            type: 'POST',
            url: cemContent.attr('data-edit-url'),
            data: data,
            error: function () {
                throw new Error('Failed to save changes, check the controller.');
            }
        });
    }

    function startEditing(cemWrapper) {
        cemWrapper.addClass('cem-editing');
        cemWrapper.children('.cem-toolbar').show();
        var cemContent = cemWrapper.find('cem-content');

        //  Store the current state.
        currentEditingWrapper = cemWrapper;
        cemWrapper.data('original', cemContent.html());
    }

    function stopEditing(cemWrapper) {
        cemWrapper.removeClass('cem-editing');
        cemWrapper.children('.cem-toolbar').hide();

        //  Get the content.
        var cemContent = cemWrapper.find('.cem-content');

        //  If we have an original value, set it.
        if (cemWrapper.data('original') != null)
            cemContent.html(cemWrapper.data('original'));
    }
});