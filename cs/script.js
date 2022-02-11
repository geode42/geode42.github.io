const first_name = document.getElementById('first-name')
const last_name = document.getElementById('last-name')
const email = document.getElementById('email')
const hw_number = document.getElementById('hw-number')
const worked_with = document.getElementById('worked-with')
const advised_by = document.getElementById('advised-by')
const comment_syntax = document.getElementById('comment-syntax')
const code_block = document.getElementById('code-block')
const clipboard_button = document.getElementById('clipboard-button')
const footer_github_icon = document.getElementById('footer-github-icon')
const footer_github_hyperlink = document.getElementById('footer-github-hyperlink')
footer_github_hyperlink.draggable = false
footer_github_icon.draggable = false

var code_block_text = '// Fill in all of the input fields!\n\n\n\n'
code_block.innerHTML = code_block_text

var clipboard_currently_copied = null
const header_format = '{comment_syntax}{first_name} {last_name} {email}\n{comment_syntax}hw{hw_number}\n{comment_syntax}Worked with {worked_with}\n{comment_syntax}Advised by {advised_by}'

function copy_to_clipboard() {
	navigator.clipboard.writeText(code_block_text)
	clipboard_button.style.backgroundColor = 'rgb(61, 180, 114)'
	clipboard_currently_copied = JSON.parse(JSON.stringify(code_block_text));
}

function checkInputs() {
	var isValid = true;
	$('input').filter('[required]').each(function () {
		if ($(this).val() === '') {
			$('#confirm').prop('disabled', true)
			isValid = false;
			return false;
		}
	});
	if (isValid) { $('#confirm').prop('disabled', false) }
	return isValid;
}

$('input').filter('[required]').on('input', function () {
	if (checkInputs() == true) {
		code_block.style.color = 'rgb(187, 192, 201)'
		code_block_text = header_format
			.replace('{comment_syntax}', comment_syntax.value)
			.replace('{comment_syntax}', comment_syntax.value)
			.replace('{comment_syntax}', comment_syntax.value)
			.replace('{comment_syntax}', comment_syntax.value)
			.replace('{first_name}', first_name.value)
			.replace('{last_name}', last_name.value)
			.replace('{email}', email.value)
			.replace('{hw_number}', hw_number.value)
			.replace('{worked_with}', worked_with.value)
			.replace('{advised_by}', advised_by.value)
		code_block.innerHTML = code_block_text
		clipboard_button.disabled = false
		if (code_block_text != clipboard_currently_copied) {
			clipboard_button.style.backgroundColor = 'rgb(248, 207, 73)'
		}
		else {
			clipboard_button.style.backgroundColor = 'rgb(61, 180, 114)'
		}
	}
	else {
		code_block.style.color = 'rgb(119, 134, 161)'
		clipboard_button.disabled = true
		clipboard_button.style.backgroundColor = ''
	}
})