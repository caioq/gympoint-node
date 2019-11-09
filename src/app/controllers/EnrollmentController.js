import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, addMonths } from 'date-fns';

import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // obtem estudante
    const student = await Student.findOne({
      where: { id: student_id },
    });
    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }
    // obtem plano
    const plan = await Plan.findOne({
      where: { id: plan_id },
    });
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }
    // verifica hora
    const startDate = parseISO(start_date);

    if (isBefore(startDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted.' });
    }
    // calcula enrollment price
    const { duration, price } = plan;
    const totalPrice = duration * price;
    // calcula end date
    const endDate = addMonths(startDate, duration);
    console.log(plan_id);

    const newEnrollment = {
      student_id,
      plan_id,
      start_date,
      end_date: endDate,
      price: totalPrice,
    };
    const enrollment = await Enrollment.create(newEnrollment);

    return res.status(200).json(enrollment);
  }
}

export default new EnrollmentController();
