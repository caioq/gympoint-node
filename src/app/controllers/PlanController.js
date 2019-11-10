import * as Yup from 'yup';

import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({});

    return res.status(200).json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const plan = await Plan.create(req.body);

    return res.status(201).json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    let plan = await Plan.findByPk(req.params.id);

    plan = await plan.update(req.body);

    return res.status(200).json(plan);
  }

  async delete(req, res) {
    const plan = await Plan.destroy({ where: { id: req.params.id } });

    return res.json(plan);
  }
}

export default new PlanController();
