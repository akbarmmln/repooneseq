exports.returnErrorFunction = function(resObject, errorMessageLogger, errorObject){
    resObject.write('<html><head></head><body>');
    resObject.write('<script>window.location.href="javascript:history.back(-1)"</script>');
    resObject.end('</body></html>');
    return;
}  