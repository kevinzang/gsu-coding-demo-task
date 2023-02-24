import {Express} from 'express';
import path from 'path';

import {STATIC_DIR} from './constants';
import {getFeedback, createFeedback} from './db/class-user-feedback';

interface ClassUserFeedbackAPIData {
  userEmail?: string | null;
  classId?: string | null;
  rating?: number | string | null;
  comment?: string | null;
}

export function routeFeedback(server: Express) {
  server.get('/feedback/', (req, res) => {
    res.sendFile(path.join(STATIC_DIR, 'feedback.html'));
  });

  server.post('/feedback/', async (req, res) => {
    try {
      const body = req.body as ClassUserFeedbackAPIData;

      // For a fully built website, I'd get the user email (i.e. user id) from
      // authentication middleware. E.g. the middleware would define
      // `req.user = AuthenticatedUser()`, and the API handler would use `req.user.email`.
      // To keep this implementation simple, I don't implement authentication,
      // and instead get the user email from the POST data.
      const userEmail = body.userEmail;
      if (typeof userEmail !== 'string' || !userEmail) {
        return res.status(400).send({detail: 'Invalid user email'});
      }

      const classId = body.classId;
      if (typeof classId !== 'string' || !classId) {
        return res.status(400).send({detail: 'Invalid class id'});
      }

      const rating = parseFloat(String(body.rating));
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).send({detail: 'Enter a rating from 1 to 5'});
      }

      const comment = body.comment ?? '';
      if (typeof comment !== 'string') {
        return res.status(400).send({detail: 'Enter comment as text'});
      }

      const existingFeedback = await getFeedback(userEmail);
      if (existingFeedback) {
        return res
          .status(400)
          .send({detail: 'Feedback cannot be re-submitted'});
      }

      await createFeedback({userEmail, classId, rating, comment});
      res.sendStatus(200);
    } catch (e) {
      console.error(e);
      return res.status(500).send({detail: 'Unexpected error occurred'});
    }
  });
}
