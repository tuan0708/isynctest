// doi thanh dd/MM/yyyy
export function convertSQLDate(inputFormat) {
  function pad(s) { return (s < 10) ? '0' + s : s; }
  var d = new Date(inputFormat);
  return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
}

// validate number
export function validateNumber(e) {
  if (/[^\d.]|\.(?=.*\.)/g.test(e.target.value))
    e.target.value = e.target.value.replace(/[^\d.]|\.(?=.*\.)/g, '')
}

// validate prices
export function validatePrice(e) {
  if (/[^\d.]|\.(?=.*\.)/g.test(e.target.value))
    e.target.value = e.target.value.replace(/[^\d.]|\.(?=.*\.)/g, '');
  if (e.target.value.match(/[\d].*\.[\d]{2}/) != null)
    e.target.value = e.target.value.match(/[\d].*\.[\d]{2}/)[0];
  return e.target.value;
}

export function validateInput(formId, id, btnExecId) {
  var valueInput = $('#' + id).val().toString().trim();
  if ($('#' + id).attr('disabled') === undefined && Number(valueInput) <= 0) {
    $('#' + id).addClass('is-invalid');
    $('#' + btnExecId).addClass('disabled');
  } else {
    var isValid = true;
    $.each($('#' + formId + ' input'), (key, val) => {
      if ($(val).attr('disabled') === undefined && ($(val).val().toString().trim() === ''
        || $(val).val().toString().trim() === '0')) {
        isValid = false;
        $(val).addClass('is-invalid');
        $('#' + btnExecId).addClass('disabled');
      } else {
        $(val).removeClass('is-invalid');
      }
    });
    if (isValid) {
      $('#' + btnExecId).removeClass('disabled');
    }
  }
  $('#' + id).val(valueInput.match(/[\d|.]+/) === null ? '' : valueInput.match(/[\d|.]+/)[0]);
}

export function showLoading(val) {
  if (val) $('#loading').show();
  else $('#loading').hide();
}

export function showLoadingData(loadingId, val) {
  if (val) {
    $('#nav-positions-content, #nav-orders-content, #nav-notifications-content').addClass('d-none');
    $('#' + loadingId).removeClass('d-none');
  }
  else {
    $('#nav-positions-content, #nav-orders-content, #nav-notifications-content').removeClass('d-none');
    $('#' + loadingId).addClass('d-none');
  }
}
