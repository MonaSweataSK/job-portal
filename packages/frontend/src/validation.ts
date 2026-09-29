import { allowedFileTypes, maxFileSize } from './api/constants';

export interface ApplicationFormValues {
	fullName: string;
	email: string;
	phone: string;
	coverLetter: string;
}

export type ApplicationField = keyof ApplicationFormValues | 'photo';
export type FieldErrors = Partial<Record<ApplicationField, string>>;

const emailPattern = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
const phonePattern = /^\+?[0-9](?:[0-9\s().-]*[0-9])?$/;

export const validateApplication = (
	application: ApplicationFormValues,
	photo: File | null,
): FieldErrors => {
	const errors: FieldErrors = {};

	if (!application.fullName.trim()) {
		errors.fullName = 'Enter your full name.';
	}

	if (!application.email) {
		errors.email = 'Enter your email address.';
	} else if (application.email.length > 254 || !emailPattern.test(application.email)) {
		errors.email = 'Enter a valid email address.';
	}

	if (!application.phone) {
		errors.phone = 'Enter your phone number.';
	} else {
		const digitCount = application.phone.match(/\d/g)?.length ?? 0;
		if (!phonePattern.test(application.phone) || digitCount < 7 || digitCount > 15 || application.phone.length > 32) {
			errors.phone = 'Enter a valid phone number with 7 to 15 digits.';
		}
	}

	if (!application.coverLetter) {
		errors.coverLetter = 'Add a cover letter.';
	} else if (application.coverLetter.length < 100) {
		errors.coverLetter = 'Write at least 100 characters.';
	}

	if (!photo) {
		errors.photo = 'Choose a profile photo.';
	} else if (!allowedFileTypes.includes(photo.type)) {
		errors.photo = 'Choose a JPEG, PNG, or WebP image.';
	} else if (photo.size <= 0 || photo.size >= maxFileSize) {
		errors.photo = 'The image must be smaller than 5 MB.';
	}

	return errors;
};
