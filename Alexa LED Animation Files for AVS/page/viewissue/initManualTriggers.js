/* eslint-disable */
;define("codebarrel/init-manual-triggers", [
    'jquery',
    'jira/flag',
    'jira/util/events',
    'jira/util/events/types',
    'jira/issue',
    'jira/util/browser',
  ],
  function ($,
            flag,
            Events,
            EventTypes,
            Issue,
            Browser) {
    "use strict";

    const isIssuePage = function () {
      return JIRA && JIRA.Issue && JIRA.Issue.getStalker && JIRA.Issue.getStalker().length > 0;
    };

    const showSpinner = function () {
      const spinContainer = $('<div class="toolbar-group" style="width:16px;height:16px;padding-top: 4px;"/>');
      const issueOperations = $('#stalker .ops-menus .toolbar-split-left');
      if (issueOperations.length > 0) {
        issueOperations.append(spinContainer);
        spinContainer.spin();
      }
      return spinContainer;
    };

    const executeManualTrigger = function (url) {
      return $.ajax({
        url: url,
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        success: function () {
          flag.showSuccessMsg(AJS.I18n.getText('com.codebarrel.automation.title'),
            AJS.I18n.getText('com.codebarrel.automation.trigger.manual.success'));
        },
        error: function () {
          flag.showErrorMsg(AJS.I18n.getText('com.codebarrel.automation.title'),
            AJS.I18n.getText('com.codebarrel.automation.trigger.manual.error.exec'));
        }
      });
    };

    $(document).on('click', '.cb-manual-rule-trigger', function (e) {
      e.preventDefault();
      const spinner = showSpinner();
      const url = $(this).attr('href');
      // CBS-6627 When performing actions via cog from the issues panel on epic a magical &returnUrl param gets added
      // to the url which means the ajax request is invalid. So we need to remove it.
      const urlWithoutReturnUrl = url.split('&returnUrl=')[0];
      executeManualTrigger(urlWithoutReturnUrl)
        .always(function () {
          spinner.spinStop();
        })
        .done(function () {
          if (isIssuePage()) {
            Events.trigger(EventTypes.REFRESH_ISSUE_PAGE, [Issue.getIssueId()]);
          } else {
            Browser.reloadViaWindowLocation();
          }
        });
    });
  });

require("codebarrel/init-manual-triggers");
/* eslint-enable */

